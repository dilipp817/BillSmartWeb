"use client";

import { useState } from "react";

import { z } from "zod";
import { AlertCircle, Loader2, Minus, Percent, Plus, ShoppingCart, Trash2, X } from "lucide-react";

import { OrderType, TAX_RATE_CGST, TAX_RATE_SGST, UserRole } from "@/constants";
import { RoleGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FoodBrowseGrid } from "@/features/menu/components/food-browse-grid";
import type { FoodListItem } from "@/features/menu/types";
import { TableSelectionGrid } from "@/features/tables/components/table-selection-grid";
import type { AvailableTableDto } from "@/features/tables/types";
import { cartItemCount, cartRunningTotal, useCartStore } from "@/store/use-cart-store";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/utils/currency";

import { useCreateOrder } from "@/features/orders/hooks/use-create-order";

const discountSchema = z.coerce
  .number()
  .min(0, "Must be 0 or more")
  .refine((v) => Math.round(v * 100) / 100 === v, "Max 2 decimal places");

export default function CreateOrderPage() {
  const [notes, setNotes] = useState("");
  const [discountInput, setDiscountInput] = useState("0");
  const [discountError, setDiscountError] = useState<string | null>(null);

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
  const isTableManagementEnabled = useFeatureFlag("is_table_management_enabled");
  const isDiscountEnabled = useFeatureFlag("is_bill_discount_enabled");

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleAddToCart = (food: FoodListItem) => addItem(food);
  const handleRemoveFromCart = (food: FoodListItem) =>
    updateQuantity(food.id, (cartQuantities[food.id] ?? 1) - 1);

  const handleTableSelect = (table: AvailableTableDto) => setTable(table.id, OrderType.DINE_IN);

  const handleSubmit = () => {
    if (isDiscountEnabled) {
      const parsed = discountSchema.safeParse(discountInput);
      if (!parsed.success) {
        setDiscountError(parsed.error.issues[0]?.message ?? "Invalid discount");
        return;
      }
      setDiscountError(null);
      submitOrder(notes, parsed.data > 0 ? parsed.data : undefined);
    } else {
      submitOrder(notes);
    }
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const totalItems = cartItemCount(items);
  const runningTotal = cartRunningTotal(items);
  const discountValue = Math.max(0, Number(discountInput) || 0);
  const discountedSubtotal = Math.max(0, runningTotal - discountValue);
  const cgst = discountedSubtotal * TAX_RATE_CGST;
  const sgst = discountedSubtotal * TAX_RATE_SGST;
  const estimatedTotal = discountedSubtotal + cgst + sgst;
  const canSubmit = items.length > 0 && !isPending;

  /** Map of foodId → quantity for FoodCard selection state */
  const cartQuantities: Record<number, number> = Object.fromEntries(
    items.map((item) => [item.id, item.quantity])
  );

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full gap-4 lg:gap-6">
      {/* ── Left: Food Browse ─────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1 overflow-y-auto">
        <h1 className="mb-4 text-xl font-semibold">New Order</h1>
        <FoodBrowseGrid
          onAddToCart={handleAddToCart}
          onRemoveFromCart={handleRemoveFromCart}
          cartQuantities={cartQuantities}
        />
      </div>

      {/* ── Right: Cart Panel — always full height, Place Order never scrolls away ── */}
      <aside className="flex h-full w-72 shrink-0 flex-col overflow-hidden lg:w-80 xl:w-96">
        {/* Table selection — feature-flagged; max-h so it never pushes cart out of view */}
        {isTableManagementEnabled && (
          <div className="mb-4 max-h-48 shrink-0 overflow-y-auto">
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
              Table
            </p>
            <TableSelectionGrid selectedTableId={tableId} onSelect={handleTableSelect} />
          </div>
        )}

        {/* Cart card — fills remaining height, items scroll inside */}
        <div className="bg-card ring-foreground/10 flex min-h-48 flex-1 flex-col rounded-xl ring-1">
          {/* Cart header — always visible */}
          <div className="shrink-0 border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-semibold">
                <ShoppingCart className="size-4" />
                Cart
                {totalItems > 0 && (
                  <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    {totalItems}
                  </span>
                )}
              </h2>
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => useCartStore.getState().clearCart()}
                  className="text-muted-foreground hover:text-destructive flex items-center gap-1 text-xs transition-colors"
                  aria-label="Clear cart"
                >
                  <X className="size-3.5" />
                  Clear
                </button>
              )}
            </div>

            {/* Order type badge */}
            <div className="mt-2">
              <span
                className={
                  orderType === OrderType.DINE_IN
                    ? "inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800"
                    : "inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800"
                }
              >
                {orderType === OrderType.DINE_IN
                  ? tableId !== null
                    ? `Dine In · Table ${tableId}`
                    : "Dine In"
                  : "Takeaway"}
              </span>
            </div>
          </div>

          {/* Items list — this is the only part that scrolls */}
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

          {/* Cart footer — always pinned at bottom, never scrolls away */}
          <div className="shrink-0 space-y-3 border-t px-4 py-3">
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
                className="h-8 text-sm"
              />
            </div>

            {/* Discount input — MANAGER / ADMIN only, feature-flagged */}
            {isDiscountEnabled && (
              <RoleGuard allowedRoles={[UserRole.MANAGER, UserRole.ADMIN]}>
                <div>
                  <Label
                    htmlFor="discount-input"
                    className="text-muted-foreground mb-1 flex items-center gap-1 text-xs font-medium tracking-wide uppercase"
                  >
                    <Percent className="size-3" />
                    Discount (₹)
                  </Label>
                  <Input
                    id="discount-input"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={discountInput}
                    onChange={(e) => {
                      setDiscountInput(e.target.value);
                      setDiscountError(null);
                    }}
                    className="h-8 text-sm"
                  />
                  {discountError && (
                    <p className="text-destructive mt-1 text-xs">{discountError}</p>
                  )}
                </div>
              </RoleGuard>
            )}

            {/* Tax breakdown */}
            {items.length > 0 && (
              <div className="bg-muted divide-y rounded-lg text-sm">
                <div className="flex justify-between px-3 py-1.5">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(runningTotal)}</span>
                </div>
                {discountValue > 0 && (
                  <div className="flex justify-between px-3 py-1.5">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">−{formatCurrency(discountValue)}</span>
                  </div>
                )}
                <div className="flex justify-between px-3 py-1.5">
                  <span className="text-muted-foreground">CGST (9%)</span>
                  <span>{formatCurrency(cgst)}</span>
                </div>
                <div className="flex justify-between px-3 py-1.5">
                  <span className="text-muted-foreground">SGST (9%)</span>
                  <span>{formatCurrency(sgst)}</span>
                </div>
                <div className="flex justify-between px-3 py-2 font-semibold">
                  <span>Est. Total</span>
                  <span>{formatCurrency(estimatedTotal)}</span>
                </div>
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
          </div>
        </div>
      </aside>
    </div>
  );
}
