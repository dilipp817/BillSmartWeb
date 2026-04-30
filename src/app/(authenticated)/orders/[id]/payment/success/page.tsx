"use client";

import { use } from "react";

import { AlertCircle, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import { OrderType } from "@/constants";
import { Button } from "@/components/ui/button";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { useAuthStore } from "@/store/use-auth-store";
import { PaymentHistoryList } from "@/features/billing/components/payment-history-list";
import { useReleaseTable } from "@/features/billing/hooks/use-release-table";
import { useBill } from "@/features/billing/hooks/use-bill";
import { PrintButton } from "@/features/print/components/print-button";

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paymentId?: string; billId?: string; tableId?: string }>;
}

// ─── Print sub-component ──────────────────────────────────────────────────────

/**
 * Fetches the bill then renders PrintButton.
 * Isolated so useBill is only called when billId is present and printing is
 * potentially enabled (outer flag check happens inside PrintButton itself).
 */
function PrintBillButton({ billId, tableId }: { billId: number; tableId: number | null }) {
  const cashierName = useAuthStore((s) => s.user?.username);
  const { bill } = useBill(billId);

  if (!bill) return null;

  return (
    <PrintButton
      bill={bill}
      context={{
        order_type: tableId ? OrderType.DINE_IN : OrderType.TAKEAWAY,
        cashier_name: cashierName,
      }}
    />
  );
}

// ─── Table release sub-component ─────────────────────────────────────────────

/**
 * Rendered only when is_table_management_enabled is true AND tableId is in URL.
 * Isolated into its own component so the hook is only called when needed.
 */
function TableReleaseButton({ tableId }: { tableId: number }) {
  const { releaseTable, isPending, isError, isSuccess, errorMessage } = useReleaseTable(tableId);

  if (isSuccess) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        <CheckCircle2 className="size-4 shrink-0" />
        <span>Table released — marked as available.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full"
        size="lg"
        onClick={releaseTable}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Releasing table…
          </>
        ) : (
          "Release Table"
        )}
      </Button>
      {isError && (
        <p className="text-destructive flex items-center gap-1.5 text-xs">
          <AlertCircle className="size-3 shrink-0" />
          {errorMessage}
        </p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

/**
 * Payment Success Screen
 *
 * Shown after a payment is confirmed SUCCESS — navigated to by:
 *   - useRecordPayment (B-05): CASH / UPI / WALLET auto_process=true
 *   - useProcessPayment (B-06): CARD after PATCH /process confirms SUCCESS
 *
 * When billId is present renders PaymentHistoryList (B-07).
 * When tableId is present AND is_table_management_enabled is true, renders
 * the TableReleaseButton (B-08) so staff can free the table after payment.
 */
export default function PaymentSuccessPage({ params, searchParams }: PageProps) {
  const { id } = use(params);
  const {
    paymentId: paymentIdParam,
    billId: billIdParam,
    tableId: tableIdParam,
  } = use(searchParams);

  const orderId = Number(id);
  const billId = billIdParam ? Number(billIdParam) : null;
  const tableId = tableIdParam ? Number(tableIdParam) : null;

  const isTableMgmtEnabled = useFeatureFlag("is_table_management_enabled");

  return (
    <div className="mx-auto max-w-lg space-y-6 py-8">
      {/* ── Success indicator ──────────────────────────────────────────────── */}
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

      {/* ── Payment history (B-07) ─────────────────────────────────────────── */}
      {billId && <PaymentHistoryList billId={billId} />}

      {/* ── Print receipt (P-03) ───────────────────────────────────────────── */}
      {billId && <PrintBillButton billId={billId} tableId={tableId} />}

      {/* ── Table release (B-08) ───────────────────────────────────────────── */}
      {isTableMgmtEnabled && tableId && <TableReleaseButton tableId={tableId} />}

      {/* ── Navigation actions ──────────────────────────────────────────────── */}
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
