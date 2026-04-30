import { Loader2 } from "lucide-react";

import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

import type { PaymentListItem } from "../types";
import { usePaymentsByBill } from "../hooks/use-payments-by-bill";
import { PaymentStatusBadge } from "./payment-status-badge";

// ─── Method label map ─────────────────────────────────────────────────────────

const METHOD_LABELS: Record<string, string> = {
  CASH: "Cash",
  CARD: "Card",
  UPI: "UPI",
  WALLET: "Wallet",
};

// ─── Row ─────────────────────────────────────────────────────────────────────

function PaymentRow({ payment }: { payment: PaymentListItem }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-sm font-medium">
          {METHOD_LABELS[payment.payment_method] ?? payment.payment_method}
        </p>
        <p className="text-muted-foreground text-xs">{formatDate(payment.created_at)}</p>
      </div>
      <div className="flex items-center gap-3">
        <PaymentStatusBadge status={payment.status} />
        <span className="text-sm font-semibold">{formatCurrency(payment.amount)}</span>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PaymentHistoryListProps {
  billId: number;
}

/**
 * PaymentHistoryList — displays the individual payment rows for a bill.
 *
 * Uses usePaymentsByBill to fetch from GET /api/v1/payments/bill/{billId}.
 *
 * Phase 1: split payment is backend-disabled, so only one payment row will
 * appear. The component is ready for multiple rows once the flag is enabled.
 */
export function PaymentHistoryList({ billId }: PaymentHistoryListProps) {
  const { payments, isPending, isError } = usePaymentsByBill(billId);

  return (
    <div className="rounded-xl border">
      <div className="border-b px-4 py-3">
        <p className="text-sm font-semibold">Payment History</p>
      </div>

      {isPending && (
        <div className="text-muted-foreground flex items-center justify-center gap-2 px-4 py-6 text-sm">
          <Loader2 className="size-4 animate-spin" />
          <span>Loading payments…</span>
        </div>
      )}

      {isError && (
        <p className="text-destructive px-4 py-4 text-sm">Could not load payment history.</p>
      )}

      {!isPending && !isError && payments.length === 0 && (
        <p className="text-muted-foreground px-4 py-4 text-sm">No payments recorded yet.</p>
      )}

      {!isPending && !isError && payments.length > 0 && (
        <div className="divide-y">
          {payments.map((payment) => (
            <PaymentRow key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  );
}
