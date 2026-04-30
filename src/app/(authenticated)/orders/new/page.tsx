"use client";

import { useState } from "react";

import { AlertCircle, Loader2, Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";

import { OrderType } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FoodBrowseGrid } from "@/features/menu/components/food-browse-grid";
import type { FoodListItem } from "@/features/menu/types";
import { TableSelectionGrid } from "@/features/tables/components/table-selection-grid";
import type { AvailableTableDto } from "@/features/tables/types";
import { cartItemCount, cartRunningTotal, useCartStore } from "@/store/use-cart-store";
import { formatCurrency } from "@/utils/currency";

import { useCreateOrder } from "@/features/orders/hooks/use-create-order";

export default function CreateOrderPage() {
  const [notes, setNotes] = useState("");

  // ── Cart state ──────────────────────────────────────────────────────────────
  const {
    items,
    tableId,
    orderType,
    addItem,
    removeItem,
    updateQuantity,
    setSpecialRequest,
    setTable,
  } = useCartStore();

  // ── Order mutation ──────────────────────────────────────────────────────────
  const { submitOrder, isPending, isError, errorMessage } = useCreateOrder();

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAddToCart = (food: FoodListItem) => addItem(food);

  const handleTableSelect = (table: AvailableTableDto) => setTable(table.id, OrderType.DINE_IN);

  const handleSubmit = () => submitOrder(notes);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const totalItems = cartItemCount(items);
  const runningTotal = cartRunningTotal(items);
  const canSubmit = items.length > 0 && !isPending;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full gap-6">
      {/* ── Left: Food Browse ─────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1 overflow-y-auto">
        <h1 className="mb-4 text-xl font-semibold">New Order</h1>
        <FoodBrowseGrid onAddToCart={handleAddToCart} />
      </div>

      {/* ── Right: Cart Panel ─────────────────────────────────────────────── */}
      <aside className="flex w-80 shrink-0 flex-col gap-4 overflow-y-auto">
        {/* Table selection — feature-flagged; hidden when flag off (= TAKEAWAY) */}
        <div>
          <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            Table
          </p>
          <TableSelectionGrid selectedTableId={tableId} onSelect={handleTableSelect} />
          {orderType === OrderType.TAKEAWAY && (
            <p className="text-muted-foreground mt-1 text-xs">Takeaway order</p>
          )}
        </div>

        {/* Cart items */}
        <div className="bg-card ring-foreground/10 flex-1 rounded-xl p-4 ring-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-semibold">
              <ShoppingCart className="size-4" />
              Cart
              {totalItems > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {totalItems}
                </span>
              )}
            </h2>
          </div>

          {items.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">No items added yet.</p>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm leading-snug font-medium">{item.name}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive shrink-0 transition-colors"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  {/* Qty controls */}
                  <div className="mt-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="bg-muted hover:bg-muted/80 flex size-6 items-center justify-center rounded transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-6 text-center text-sm tabular-nums">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="bg-muted hover:bg-muted/80 flex size-6 items-center justify-center rounded transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>

                  {/* Special request */}
                  <Input
                    type="text"
                    placeholder="Special request…"
                    value={item.special_requests}
                    onChange={(e) => setSpecialRequest(item.id, e.target.value)}
                    className="mt-1.5 h-7 text-xs"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Notes */}
        <div>
          <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
            Order Notes
          </p>
          <Input
            type="text"
            placeholder="e.g. Window seat please"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Running total */}
        {items.length > 0 && (
          <div className="bg-muted rounded-lg px-4 py-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal (excl. tax)</span>
              <span className="font-semibold">{formatCurrency(runningTotal)}</span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Tax (CGST + SGST) calculated at billing
            </p>
          </div>
        )}

        {/* Error */}
        {isError && errorMessage && (
          <div className="text-destructive flex items-center gap-2 text-sm">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Place Order */}
        <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full">
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Placing Order…
            </>
          ) : (
            "Place Order"
          )}
        </Button>
      </aside>
    </div>
  );
}
