"use client";

import { useState } from "react";

import { AlertCircle, Inbox } from "lucide-react";

import { OrderListRow } from "@/features/orders/components/order-list-row";
import { OrdersFilterBar, type OrderFilter } from "@/features/orders/components/orders-filter-bar";
import { useOrders } from "@/features/orders/hooks/use-orders";
import type { OrderStatus } from "@/constants";

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState<OrderFilter>("all");
  const [search, setSearch] = useState("");

  // search takes priority — when non-empty, filter is ignored by the hook
  const statusFilter =
    activeFilter === "all" || activeFilter === "active"
      ? activeFilter
      : (activeFilter as OrderStatus);

  const { orders, total, isLoading, isError } = useOrders({
    filter: statusFilter,
    search,
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Orders</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          {isLoading ? "Loading…" : `${total} order${total !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Filters */}
      <OrdersFilterBar
        activeFilter={activeFilter}
        search={search}
        onFilterChange={setActiveFilter}
        onSearchChange={setSearch}
      />

      {/* Error */}
      {isError && (
        <div className="text-destructive flex items-center gap-2 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          <span>Could not load orders. They will refresh automatically.</span>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <OrdersTableSkeleton />
      ) : orders.length === 0 && !isError ? (
        <EmptyState search={search} />
      ) : (
        <div className="rounded-xl border">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 border-b">
                  <th className="px-4 py-3 text-sm font-medium">Order #</th>
                  <th className="px-4 py-3 text-sm font-medium">Table</th>
                  <th className="px-4 py-3 text-sm font-medium">Items</th>
                  <th className="px-4 py-3 text-sm font-medium">Total</th>
                  <th className="px-4 py-3 text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-sm font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <OrderListRow key={order.id} order={order} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function OrdersTableSkeleton() {
  return (
    <div className="rounded-xl border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b">
              {["Order #", "Table", "Items", "Total", "Status", "Created"].map((h) => (
                <th key={h} className="px-4 py-3 text-sm font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b last:border-0">
                {Array.from({ length: 6 }).map((__, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="bg-muted h-4 animate-pulse rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <Inbox className="text-muted-foreground size-10" />
      <p className="text-muted-foreground text-sm">
        {search.trim().length > 0
          ? `No orders matching "${search}"`
          : "No orders found for this filter."}
      </p>
    </div>
  );
}
