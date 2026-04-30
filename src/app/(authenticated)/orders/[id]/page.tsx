"use client";

import { use, useState } from "react";

import { AlertCircle, ArrowLeft, Loader2, Plus } from "lucide-react";
import Link from "next/link";

import { OrderStatus, OrderType, UserRole } from "@/constants";
import { Button } from "@/components/ui/button";
import { RoleGuard } from "@/components/role-guard";
import { FoodBrowseGrid } from "@/features/menu/components/food-browse-grid";
import type { FoodListItem } from "@/features/menu/types";
import { OrderStatusActions } from "@/features/orders/components/order-status-actions";
import { OrderStatusBadge } from "@/features/orders/components/order-status-badge";
import { useOrderDetail } from "@/features/orders/hooks/use-order-detail";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

// ─── Constants ────────────────────────────────────────────────────────────────

const CAN_ADD_ITEMS_STATUSES: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.HOLD];
const CANCELLABLE_STATUSES: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.IN_PROGRESS,
  OrderStatus.HOLD,
];

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const orderId = Number(id);

  const [showAddItems, setShowAddItems] = useState(false);

  const { order, isLoading, isError, addItem, isAddingItem, cancelOrder, isCancelling } =
    useOrderDetail(orderId);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (isError || !order) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <AlertCircle className="text-destructive size-8" />
        <p className="text-muted-foreground text-sm">Failed to load order.</p>
        <Link href="/orders">
          <Button variant="outline" size="sm">
            Back to Orders
          </Button>
        </Link>
      </div>
    );
  }

  const canAddItems = CAN_ADD_ITEMS_STATUSES.includes(order.status);
  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  const tableLabel =
    order.order_type === OrderType.DINE_IN && order.table_number
      ? `Table ${order.table_number}`
      : "Takeaway";

  const handleAddToOrder = (food: FoodListItem) => addItem(food);

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/orders">
            <Button variant="ghost" size="icon" aria-label="Back to orders">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">{order.order_number}</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {tableLabel} · {formatDate(order.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <OrderStatusActions orderId={orderId} currentStatus={order.status} />
          <RoleGuard allowedRoles={[UserRole.MANAGER, UserRole.ADMIN]}>
            <Button
              variant="destructive"
              size="sm"
              onClick={cancelOrder}
              disabled={isCancelling || !canCancel}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Cancelling…
                </>
              ) : (
                "Cancel Order"
              )}
            </Button>
          </RoleGuard>
        </div>
      </div>

      {/* ── Items ─────────────────────────────────────────────────────────────── */}
      <div className="rounded-xl border">
        <div className="border-b px-4 py-3">
          <h2 className="font-semibold">Items</h2>
        </div>

        <div className="divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-start justify-between gap-4 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.food_name}</p>
                {item.special_requests && (
                  <p className="text-muted-foreground mt-0.5 text-xs">{item.special_requests}</p>
                )}
              </div>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-muted-foreground">×{item.quantity}</span>
                <span className="w-24 text-right font-medium">{formatCurrency(item.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-1 border-t px-4 py-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total (incl. tax)</span>
            <span className="font-semibold">{formatCurrency(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* ── Notes ─────────────────────────────────────────────────────────────── */}
      {order.notes && (
        <div className="rounded-xl border px-4 py-3">
          <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
            Notes
          </p>
          <p className="text-sm">{order.notes}</p>
        </div>
      )}

      {/* ── Add Items (PENDING / HOLD only) ───────────────────────────────────── */}
      {canAddItems && (
        <div>
          <button
            type="button"
            onClick={() => setShowAddItems((v) => !v)}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="size-4" />
            {showAddItems ? "Hide food browser" : "Add items to order"}
          </button>

          {showAddItems && (
            <div className="mt-4">
              <FoodBrowseGrid onAddToCart={handleAddToOrder} />
            </div>
          )}
        </div>
      )}

      {/* Spinner overlay while adding item */}
      {isAddingItem && (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" />
          Adding item…
        </div>
      )}
    </div>
  );
}
