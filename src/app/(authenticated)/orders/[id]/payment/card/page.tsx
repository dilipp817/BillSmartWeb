"use client";

import { use } from "react";

import { AlertCircle, ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/currency";
import { useProcessPayment } from "@/features/billing/hooks/use-process-payment";

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paymentId?: string; amount?: string; billId?: string; tableId?: string }>;
}

export default function CardPaymentPage({ params, searchParams }: PageProps) {
  const { id } = use(params);
  const {
    paymentId: paymentIdParam,
    amount: amountParam,
    billId: billIdParam,
    tableId: tableIdParam,
  } = use(searchParams);

  const orderId = Number(id);
  const paymentId = paymentIdParam ? Number(paymentIdParam) : null;
  const tableId = tableIdParam ? Number(tableIdParam) : undefined;

  // Build back link preserving all URL context so a retry re-links to the bill.
  const backParams = new URLSearchParams();
  if (billIdParam) backParams.set("billId", billIdParam);
  if (amountParam) backParams.set("amount", amountParam);
  if (tableIdParam) backParams.set("tableId", tableIdParam);
  const backParamsStr = backParams.toString();
  const backHref = `/orders/${orderId}/payment${backParamsStr ? `?${backParamsStr}` : ""}`;

  const { processCardPayment, isPending, isError, errorMessage } = useProcessPayment(
    orderId,
    paymentId ?? 0,
    tableId
  );

  // Guard: paymentId must be present in the URL (set by useRecordPayment in B-05)
  if (!paymentId) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          <Link href={backHref}>
            <Button variant="ghost" size="icon" aria-label="Go back">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Card Payment</h1>
        </div>
        <div className="text-destructive flex items-center gap-2 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          <span>Payment ID is missing. Please go back and try again.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link href={backHref}>
          <Button variant="ghost" size="icon" aria-label="Go back">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Card Payment</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Order #{orderId}</p>
        </div>
      </div>

      {/* ── Card terminal info ────────────────────────────────────────────────── */}
      <div className="bg-muted/50 space-y-3 rounded-xl border p-5">
        <div className="flex items-center gap-2">
          <CreditCard className="text-primary size-5 shrink-0" />
          <p className="font-medium">Card Terminal</p>
        </div>
        <ol className="text-muted-foreground list-inside list-decimal space-y-1 text-sm">
          <li>Present the card to the POS terminal.</li>
          <li>Ask the customer to tap, swipe, or insert.</li>
          <li>Wait for the terminal to confirm approval.</li>
          <li>
            Once approved, click <strong>Confirm Payment</strong> below.
          </li>
        </ol>
        {amountParam && (
          <p className="text-sm font-medium">
            Amount: <span className="text-foreground">{formatCurrency(Number(amountParam))}</span>
          </p>
        )}
      </div>

      {/* ── Error ────────────────────────────────────────────────────────────── */}
      {isError && (
        <div className="text-destructive flex items-center gap-2 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── Confirm button ────────────────────────────────────────────────────── */}
      <Button onClick={processCardPayment} disabled={isPending} className="w-full" size="lg">
        {isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Processing…
          </>
        ) : (
          "Confirm Payment"
        )}
      </Button>

      <p className="text-muted-foreground text-center text-xs">
        Only click Confirm after the terminal shows approval.
      </p>
    </div>
  );
}
