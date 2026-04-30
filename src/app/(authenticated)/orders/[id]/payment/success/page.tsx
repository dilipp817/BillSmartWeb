"use client";

import { use } from "react";

import { CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PaymentHistoryList } from "@/features/billing/components/payment-history-list";

// ─── Page ───────────────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paymentId?: string; billId?: string }>;
}

/**
 * Payment Success Screen
 *
 * Shown after a payment is confirmed SUCCESS — navigated to by:
 *   - useRecordPayment (B-05): CASH / UPI / WALLET auto_process=true
 *   - useProcessPayment (B-06): CARD after PATCH /process confirms SUCCESS
 *
 * B-08 will extend this screen with a table-release action.
 *
 * When billId is present in the URL, renders PaymentHistoryList (B-07)
 * showing the per-payment breakdown for the bill.
 */
export default function PaymentSuccessPage({ params, searchParams }: PageProps) {
  const { id } = use(params);
  const { paymentId: paymentIdParam, billId: billIdParam } = use(searchParams);

  const orderId = Number(id);
  const billId = billIdParam ? Number(billIdParam) : null;

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      {/* ── Success indicator ──────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-4 text-center">
        <CheckCircle2 className="size-16 text-green-500" />
        <div>
          <h1 className="text-2xl font-bold">Payment Confirmed</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Order #{orderId} has been paid successfully.
          </p>
        </div>
        {paymentIdParam && (
          <p className="text-muted-foreground text-xs">Payment reference #{paymentIdParam}</p>
        )}
      </div>

      {/* ── Payment history (B-07) ──────────────────────────────────────────── */}
      {billId && <PaymentHistoryList billId={billId} />}

      {/* ── Actions ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <Link href={`/orders/${orderId}`}>
          <Button variant="outline" className="w-full" size="lg">
            <ArrowLeft className="mr-2 size-4" />
            Back to Order
          </Button>
        </Link>
        <Link href="/orders">
          <Button className="w-full" size="lg">
            New Order
          </Button>
        </Link>
      </div>
    </div>
  );
}
