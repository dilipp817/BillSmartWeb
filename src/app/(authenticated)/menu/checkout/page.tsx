"use client";

import { useState, useEffect, Suspense } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2, Users, WifiOff } from "lucide-react";

import { OrderType, TAX_RATE_CGST, TAX_RATE_SGST } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableSelectionGrid } from "@/features/tables/components/table-selection-grid";
import type { AvailableTableDto } from "@/features/tables/types";
import { cartRunningTotal, useCartStore } from "@/store/use-cart-store";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { formatCurrency } from "@/utils/currency";
import { useCreateOrder } from "@/features/orders/hooks/use-create-order";

type Step = "table" | "confirm";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const discountParam = searchParams.get("discount");
  const discount = discountParam ? Number(discountParam) : undefined;

  const isTableManagementEnabled = useFeatureFlag("is_table_management_enabled");

  const { items, orderType, notes, setNotes, setTable } = useCartStore();
  const { submitOrder, isPending, isError, isConflict, errorMessage } = useCreateOrder();
  const isOnline = useOnlineStatus();

  // Start at table-selection step when DINE_IN + table management enabled;
  // otherwise skip straight to confirmation.
  const needsTableStep = isTableManagementEnabled && orderType === OrderType.DINE_IN;
  const [userAdvancedStep, setUserAdvancedStep] = useState(false);
  const [selectedTable, setSelectedTable] = useState<AvailableTableDto | null>(null);

  // Derive current step: once the user explicitly advances, stay at confirm.
  // If flags load and table step is no longer needed, also go to confirm.
  const step: Step = userAdvancedStep || !needsTableStep ? "confirm" : "table";

  // Redirect to /menu if cart is empty (e.g. on hard refresh)
  useEffect(() => {
    if (items.length === 0) {
      router.replace("/menu");
    }
  }, [items.length, router]);

  const runningTotal = cartRunningTotal(items);
  const gst = runningTotal * (TAX_RATE_CGST + TAX_RATE_SGST);
  const estimatedTotal = runningTotal + gst;

  const handleConfirmTable = () => {
    if (!selectedTable) return;
    setTable(selectedTable.id, OrderType.DINE_IN);
    setUserAdvancedStep(true);
  };

  const handlePlaceOrder = () => submitOrder(notes, discount);

  // ── Step 1: Table Selection ────────────────────────────────────────────────
  if (step === "table") {
    return (
      <div className="mx-auto max-w-3xl space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Back to menu"
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Select Table</h1>
            <p className="text-muted-foreground text-sm">
              Choose an available table for this order
            </p>
          </div>
        </div>

        {/* Offline banner */}
        {!isOnline && (
          <div className="flex items-center gap-2 rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
            <WifiOff className="size-4 shrink-0" />
            Table selection unavailable offline. Switch to Takeaway or use last known table.
          </div>
        )}

        {/* Table grid — fullscreen, not inline in cart */}
        <TableSelectionGrid
          selectedTableId={selectedTable?.id ?? null}
          onSelect={isOnline ? setSelectedTable : () => {}}
          className={`grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6${
            !isOnline ? "pointer-events-none opacity-50" : ""
          }`}
        />

        {/* Footer */}
        <div className="flex items-center justify-between border-t pt-4">
          <p className="text-muted-foreground text-sm">
            {selectedTable ? `Selected: Table ${selectedTable.table_number}` : "No table selected"}
          </p>
          <Button
            onClick={handleConfirmTable}
            disabled={!selectedTable || !isOnline}
            className="min-w-32"
          >
            Confirm Table →
          </Button>
        </div>
      </div>
    );
  }

  // ── Step 2: Create Order Confirmation ─────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => (needsTableStep ? setUserAdvancedStep(false) : router.back())}
          aria-label="Back"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-xl font-semibold">New Order</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        {/* ── Left: Order meta ──────────────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Table / order type card */}
          <div className="bg-card ring-foreground/10 rounded-xl p-4 ring-1">
            {selectedTable ? (
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Table
                </p>
                <p className="text-2xl font-bold">T-{selectedTable.table_number}</p>
                <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
                  <Users className="size-3.5" />
                  <span>{selectedTable.capacity} seats</span>
                </div>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                  Available
                </span>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                  Order Type
                </p>
                <p className="text-lg font-semibold">
                  {orderType === OrderType.DINE_IN ? "Dine In" : "Takeaway"}
                </p>
              </div>
            )}
          </div>

          {/* Order type (read-only) */}
          <div className="bg-card ring-foreground/10 rounded-xl p-4 ring-1">
            <p className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
              Order Type
            </p>
            <span
              className={
                orderType === OrderType.DINE_IN
                  ? "inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                  : "inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800"
              }
            >
              {orderType === OrderType.DINE_IN ? "Dine In" : "Takeaway"}
            </span>
            <p className="text-muted-foreground mt-2 text-xs">Cannot be changed at this step.</p>
          </div>
        </div>

        {/* ── Right: Item list + totals + Place Order ───────────────────────── */}
        <div className="bg-card ring-foreground/10 flex flex-col rounded-xl ring-1">
          {/* Item list (read-only) */}
          <div className="shrink-0 border-b px-4 py-3">
            <h2 className="font-semibold">Order Items ({items.length})</h2>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-2 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    {item.special_requests && (
                      <p className="text-muted-foreground truncate text-xs">
                        {item.special_requests}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-muted-foreground text-sm">×{item.quantity}</span>
                    <span className="w-20 text-right text-sm font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer: notes + totals + button */}
          <div className="shrink-0 space-y-3 border-t px-4 py-4">
            {/* Kitchen notes */}
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                Kitchen Notes
              </p>
              <Input
                type="text"
                placeholder="e.g. No onion, extra spicy, window seat…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            {/* Totals */}
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
            <p className="text-muted-foreground text-xs">
              * Actual tax (CGST 9% + SGST 9%) is calculated by the server at bill generation.
            </p>

            {/* Error / Conflict / Place Order */}
            {isConflict ? (
              /* 409 — table taken since selection: replace button with conflict banner */
              <div className="space-y-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-destructive mt-0.5 size-4 shrink-0" />
                  <div>
                    <p className="text-destructive text-sm font-medium">
                      Table no longer available
                    </p>
                    <p className="text-muted-foreground mt-0.5 text-xs">
                      {selectedTable
                        ? `Table ${selectedTable.table_number} was taken by another order.`
                        : "The selected table is now occupied."}{" "}
                      Please pick a different table.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setUserAdvancedStep(false)}
                >
                  Re-select Table
                </Button>
              </div>
            ) : (
              <>
                {isError && errorMessage && (
                  <div className="text-destructive flex items-center gap-2 text-sm">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isPending}
                  className="w-full"
                  size="lg"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Placing Order…
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
