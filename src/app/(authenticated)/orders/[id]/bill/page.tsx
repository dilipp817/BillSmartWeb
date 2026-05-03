"use client";

import { use, useState } from "react";

import { z } from "zod";
import { AlertCircle, ArrowLeft, Loader2, Receipt } from "lucide-react";
import Link from "next/link";

import { OrderType, UserRole } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RoleGuard } from "@/components/role-guard";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { useAuthStore } from "@/store/use-auth-store";
import { BillBreakdownCard } from "@/features/billing/components/bill-breakdown-card";
import { useGenerateBill } from "@/features/billing/hooks/use-generate-bill";
import { PrintButton } from "@/features/print/components/print-button";

// ─── Discount validation ──────────────────────────────────────────────────────

/**
 * Validates the discount input field.
 * Must be ≥ 0 and have at most 2 decimal places.
 * Backend enforces role restriction — this is only client-side formatting validation.
 */
const discountSchema = z.coerce
  .number()
  .min(0, "Discount must be 0 or more")
  .refine((v) => Math.round(v * 100) / 100 === v, "Max 2 decimal places");

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tableId?: string }>;
}

export default function GenerateBillPage({ params, searchParams }: PageProps) {
  const { id } = use(params);
  const { tableId: tableIdParam } = use(searchParams);
  const orderId = Number(id);
  const tableId = tableIdParam ? Number(tableIdParam) : undefined;

  const isDiscountEnabled = useFeatureFlag("is_bill_discount_enabled");
  const cashierName = useAuthStore((s) => s.user?.username);

  const [discountInput, setDiscountInput] = useState("0");
  const [discountError, setDiscountError] = useState<string | null>(null);

  const { generate, isPending, isError, errorMessage, bill } = useGenerateBill(orderId);

  const handleGenerate = () => {
    setDiscountError(null);

    // Only parse discount when the feature is enabled — otherwise always 0
    if (isDiscountEnabled) {
      const parsed = discountSchema.safeParse(discountInput);
      if (!parsed.success) {
        setDiscountError(parsed.error.issues[0]?.message ?? "Invalid discount value");
        return;
      }
      generate({ discount: parsed.data });
    } else {
      generate({ discount: 0 });
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link href={`/orders/${orderId}`}>
          <Button variant="ghost" size="icon" aria-label="Back to order">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Generate Bill</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Order #{orderId}</p>
        </div>
      </div>

      {bill ? (
        /* ── Bill generated — show breakdown + proceed button ─────────────── */
        <div className="space-y-4">
          <BillBreakdownCard bill={bill} />

          {/* Print receipt — feature-flagged, hidden when is_bill_printing_enabled is false */}
          <PrintButton
            bill={bill}
            context={{
              order_type: tableId ? OrderType.DINE_IN : OrderType.TAKEAWAY,
              cashier_name: cashierName,
            }}
          />

          <Link
            href={`/orders/${orderId}/payment?billId=${bill.id}&amount=${bill.remaining_amount}${tableId ? `&tableId=${tableId}` : ""}`}
          >
            <Button className="w-full" size="lg">
              Proceed to Payment
            </Button>
          </Link>
        </div>
      ) : (
        /* ── Pre-generation form ────────────────────────────────────────────── */
        <div className="space-y-4">
          {/*
           * Discount input — hidden entirely when:
           *   1. is_bill_discount_enabled flag is false
           *   2. Role is STAFF (RoleGuard returns null)
           * When hidden, discount always defaults to 0 (enforced above).
           */}
          {isDiscountEnabled && (
            <RoleGuard allowedRoles={[UserRole.MANAGER, UserRole.ADMIN]}>
              <div className="rounded-xl border px-4 py-4">
                <p className="mb-3 text-sm font-medium">Apply Discount (optional)</p>
                <div className="space-y-1.5">
                  <Label htmlFor="discount">Discount amount (₹)</Label>
                  <Input
                    id="discount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountInput}
                    onChange={(e) => {
                      setDiscountInput(e.target.value);
                      setDiscountError(null);
                    }}
                    disabled={isPending}
                    className="max-w-xs"
                  />
                  {discountError && (
                    <p className="text-destructive flex items-center gap-1.5 text-xs">
                      <AlertCircle className="size-3 shrink-0" />
                      {discountError}
                    </p>
                  )}
                </div>
              </div>
            </RoleGuard>
          )}

          {/* API error */}
          {isError && (
            <div className="text-destructive flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
              <AlertCircle className="size-4 shrink-0" />
              {errorMessage}
            </div>
          )}

          {/* Generate button — disabled while in-flight */}
          <Button onClick={handleGenerate} disabled={isPending} className="w-full" size="lg">
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Receipt className="mr-2 size-4" />
                Generate Bill
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
