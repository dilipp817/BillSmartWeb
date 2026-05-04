"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import {
  AlertCircle,
  List,
  Loader2,
  Minus,
  PauseCircle,
  Plus,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

import { OrderType, TAX_RATE_CGST, TAX_RATE_SGST } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FoodBrowseGrid } from "@/features/menu/components/food-browse-grid";
import type { FoodListItem } from "@/features/menu/types";
import { cartItemCount, cartRunningTotal, useCartStore } from "@/store/use-cart-store";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { formatCurrency } from "@/utils/currency";
import { HeldBillsDialog } from "@/features/billing/components/held-bills-dialog";

import { useCreateOrder } from "@/features/orders/hooks/use-create-order";

export default function MenuPage() {
  const router = useRouter();
  const [showHeldBills, setShowHeldBills] = useState(false);

  // ── Cart state ──────────────────────────────────────────────────────────────────────
  const {
    items,
    tableId,
    orderType,
    notes,
    heldBills,
    addItem,
    removeItem,
    updateQuantity,
    setSpecialRequest,
    setTable,
    setNotes,
    holdCart,
  } = useCartStore();

  // ── Order mutation (used only for TAKEAWAY direct-submit path) ───────────
  const { submitOrder, isPending, isError, errorMessage } = useCreateOrder();
  const isTableManagementEnabled = useFeatureFlag("is_table_management_enabled");

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAddToCart = (food: FoodListItem) => addItem(food);
  const handleRemoveFromCart = (food: FoodListItem) =>
    updateQuantity(food.id, (cartQuantities[food.id] ?? 1) - 1);

  /** Toggle order type. Selecting TAKEAWAY clears the table. */
  const handleOrderType = (type: OrderType) => {
    if (type === OrderType.TAKEAWAY) {
      setTable(null, OrderType.TAKEAWAY);
    } else {
      setTable(tableId, OrderType.DINE_IN);
    }
  };

  /**
   * Checkout button logic (Section 7 of spec):
   * - TAKEAWAY or table management disabled → submit directly from cart.
   * - DINE_IN + table management enabled → navigate to /menu/checkout for
   *   table selection + order confirmation screen.
   */
  const handleCheckout = () => {
    const isDineInWithTables = isTableManagementEnabled && orderType === OrderType.DINE_IN;
    if (isDineInWithTables) {
      router.push("/menu/checkout");
    } else {
      submitOrder(notes);
    }
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const totalItems = cartItemCount(items);
  const runningTotal = cartRunningTotal(items);
  const gst = runningTotal * (TAX_RATE_CGST + TAX_RATE_SGST);
  const estimatedTotal = runningTotal + gst;
  const canSubmit = items.length > 0 && !isPending;

  const isDineInWithTables = isTableManagementEnabled && orderType === OrderType.DINE_IN;

  /** Map of foodId → quantity for FoodCard selection state */
  const cartQuantities: Record<number, number> = Object.fromEntries(
    items.map((item) => [item.id, item.quantity])
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full gap-4 lg:gap-6">
      {" "}
      {showHeldBills && <HeldBillsDialog onClose={() => setShowHeldBills(false)} />}{" "}
      {/* ── Left: Food Browse ─────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1 overflow-y-auto">
        <h1 className="mb-4 text-xl font-semibold">Menu</h1>
        <FoodBrowseGrid
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          cartQuantities={cartQuantities}
        />
      </div>
      {/* ── Right: Cart Panel — always full height ─────────────────────── */}
      <aside className="flex h-full w-72 shrink-0 flex-col overflow-hidden lg:w-80 xl:w-96">
        {/* Cart card — fills full height, items scroll inside */}
        <div className="bg-card ring-foreground/10 flex min-h-48 flex-1 flex-col rounded-xl ring-1">
          {/* Cart header */}
          <div className="shrink-0 border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <ShoppingCart className="size-4" />
                New Sale
                {totalItems > 0 && (
                  <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    {totalItems}
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-1">
                {/* Held Bills button */}
                <button
                  type="button"
                  onClick={() => setShowHeldBills(true)}
                  className="text-muted-foreground hover:text-foreground relative flex items-center gap-1 rounded px-1.5 py-1 text-xs transition-colors"
                  aria-label="View held bills"
                >
                  <List className="size-3.5" />
                  {heldBills.length > 0 && (
                    <span className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full text-[9px] font-bold">
                      {heldBills.length}
                    </span>
                  )}
                </button>
                {/* Hold current cart */}
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={holdCart}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 rounded px-1.5 py-1 text-xs transition-colors"
                    aria-label="Hold current cart"
                    title="Hold"
                  >
                    <PauseCircle className="size-3.5" />
                  </button>
                )}
                {/* Clear cart */}
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => useCartStore.getState().clearCart()}
                    className="text-muted-foreground hover:text-destructive flex items-center gap-1 text-xs transition-colors"
                    aria-label="Clear cart"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Order type radio buttons */}
            <div className="mt-3 flex gap-4">
              <label className="flex cursor-pointer items-center gap-1.5 text-sm select-none">
                <input
                  type="radio"
                  name="order-type"
                  checked={orderType === OrderType.DINE_IN}
                  onChange={() => handleOrderType(OrderType.DINE_IN)}
                  className="accent-primary"
                />
                <span>Dine In</span>
              </label>
              <label className="flex cursor-pointer items-center gap-1.5 text-sm select-none">
                <input
                  type="radio"
                  name="order-type"
                  checked={orderType === OrderType.TAKEAWAY}
                  onChange={() => handleOrderType(OrderType.TAKEAWAY)}
                  className="accent-primary"
                />
                <span>Takeaway</span>
              </label>
            </div>
          </div>

          {/* Items list — scrollable */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4">
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
                        <span className="w-6 text-center text-sm tabular-nums">
                          {item.quantity}
                        </span>
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

          {/* Cart footer */}
          <div className="shrink-0 space-y-3 border-t px-4 py-3">
            {/* Notes — only shown for TAKEAWAY (DINE_IN notes are on the confirmation screen) */}
            {!isDineInWithTables && (
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  Order Notes
                </p>
                <Input
                  type="text"
                  placeholder="e.g. No onion, extra spicy…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            )}

            {/* Discount applied at bill generation — not in cart */}

            {/* Totals */}
            {items.length > 0 && (
              <div className="bg-muted divide-y rounded-lg text-sm">
                <div className="flex justify-between px-3 py-1.5">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(runningTotal)}</span>
                </div>
                <div className="flex justify-between px-3 py-1.5">
                  <span className="text-muted-foreground">Est. GST (18%)</span>
                  <span>{formatCurrency(gst)}</span>
                </div>
                <div className="flex justify-between px-3 py-2 font-semibold">
                  <span>Est. Total</span>
                  <span>{formatCurrency(estimatedTotal)}</span>
                </div>
              </div>
            )}

            {/* Error — only shown on direct-submit path */}
            {!isDineInWithTables && isError && errorMessage && (
              <div className="text-destructive flex items-center gap-2 text-sm">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Primary action button */}
            <Button onClick={handleCheckout} disabled={!canSubmit} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Placing Order…
                </>
              ) : isDineInWithTables ? (
                "Checkout →"
              ) : (
                "Place Order"
              )}
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}
