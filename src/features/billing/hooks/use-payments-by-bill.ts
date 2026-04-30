"use client";

import { useQuery } from "@tanstack/react-query";

import type { PaymentListItem } from "../types";
import { getPaymentsByBill } from "../services/payment-service";

// ─── Query key factory ────────────────────────────────────────────────────────

export const paymentsByBillQueryKey = (billId: number) => ["payments", "bill", billId] as const;

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UsePaymentsByBillResult {
  payments: PaymentListItem[];
  isPending: boolean;
  isError: boolean;
}

/**
 * usePaymentsByBill — query hook for listing payments on a bill.
 *
 * Used by PaymentHistoryList (B-07) to display the per-payment breakdown
 * on the payment success screen.
 *
 * Phase 1: split payment is backend-disabled (is_split_payment_enabled=false),
 * so this will always return ≤ 1 payment. The component is built and ready
 * for when the flag is enabled.
 */
export function usePaymentsByBill(billId: number): UsePaymentsByBillResult {
  const query = useQuery({
    queryKey: paymentsByBillQueryKey(billId),
    queryFn: () => getPaymentsByBill(billId),
  });

  return {
    payments: query.data?.payments ?? [],
    isPending: query.isPending,
    isError: query.isError,
  };
}
