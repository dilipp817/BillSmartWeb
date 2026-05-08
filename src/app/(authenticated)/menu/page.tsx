"use client";

import { useState, useEffect, useRef } from "react";

import { useRouter, useSearchParams } from "next/navigation";

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

import { OrderType, TAX_RATE_CGST, TAX_RATE_SGST, UserRole } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FoodBrowseGrid } from "@/features/menu/components/food-browse-grid";
import type { FoodListItem } from "@/features/menu/types";
import { cartItemCount, cartRunningTotal, useCartStore } from "@/store/use-cart-store";
import { useAuthStore } from "@/store/use-auth-store";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { formatCurrency } from "@/utils/currency";
import { HeldBillsDialog } from "@/features/billing/components/held-bills-dialog";

import { useCreateOrder } from "@/features/orders/hooks/use-create-order";

export default function MenuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showHeldBills, setShowHeldBills] = useState(false);
  const [discountInput, setDiscountInput] = useState("");

  // ── Order success pill ────────────────────────────────────────────────────
  // setState calls are inside setTimeout (not synchronous) to satisfy
  // react-hooks/set-state-in-effect. No cleanup return so the timeouts
  // survive when router.replace re-triggers this effect.
  const [orderSuccess, setOrderSuccess] = useState(false);
  const orderSuccessHandled = useRef(false);
  useEffect(() => {
    if (orderSuccessHandled.current) return;
    if (searchParams.get("order") !== "placed") return;
    orderSuccessHandled.current = true;
    router.replace("/menu", { scroll: false });
    setTimeout(() => setOrderSuccess(true), 0);
    setTimeout(() => {
      setOrderSuccess(false);
      orderSuccessHandled.current = false;
    }, 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── Live clock for cart header ─────────────────────────────────────────────
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // ── Auth ─────────────────────────────────────────────────────────────────────────────
  const role = useAuthStore((s) => s.role);
  const canApplyDiscount = role === UserRole.MANAGER || role === UserRole.ADMIN;

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
    setTable,
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
    const discount = discountInput.trim() ? Number(discountInput) : undefined;
    if (isDineInWithTables) {
      const params = discount && discount > 0 ? `?discount=${discount}` : "";
      router.push(`/menu/checkout${params}`);
    } else {
      submitOrder(notes, discount);
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
      {/* ── Order success pill ─────────────────────────────────────────────── */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className={[
          "pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center transition-opacity duration-300",
          orderSuccess ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        <div className="flex items-center gap-2 rounded-full bg-green-600 px-5 py-2 text-sm font-medium text-white shadow-lg">
          <svg className="size-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
              clipRule="evenodd"
            />
          </svg>
          Order placed
        </div>
      </div>
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
                    onClick={() => {
                      if (window.confirm("Clear all items from cart?")) {
                        useCartStore.getState().clearCart();
                      }
                    }}
                    className="text-muted-foreground hover:text-destructive flex items-center gap-1 text-xs transition-colors"
                    aria-label="Clear cart"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Sub-line: table / counter label + date-time */}
            <p className="text-muted-foreground mt-1 text-xs">
              {orderType === OrderType.DINE_IN && tableId ? `T-${tableId}` : "Counter"}{" "}
              &nbsp;|&nbsp;
              {now.toLocaleDateString("en-IN", {
                weekday: "short",
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
              &nbsp;&nbsp;
              {now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
            </p>

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
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Cart footer */}
          <div className="shrink-0 space-y-3 border-t px-4 py-3">
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

            {/* Discount — MANAGER / ADMIN only (Phase 1 placeholder) */}
            {canApplyDiscount && items.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                  Discount (₹)
                </p>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Enter discount amount…"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  className="h-8 text-sm"
                />
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
