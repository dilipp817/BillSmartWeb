"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import type { PaymentDto } from "../types";
import { processPayment } from "../services/payment-service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseProcessPaymentResult {
  /** Fire the PATCH /payments/{id}/process mutation. */
  processCardPayment: () => void;
  isPending: boolean;
  isError: boolean;
  /** Human-readable error for inline display. Never empty when isError is true. */
  errorMessage: string;
  /** The updated payment — defined only after a successful mutation. */
  payment: PaymentDto | undefined;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useProcessPayment — mutation hook for the CARD two-step flow (B-06).
 *
 * Calls PATCH /api/v1/payments/{paymentId}/process to transition a PENDING
 * CARD payment to SUCCESS after the operator confirms the physical terminal.
 *
 * ⚠️ Never optimistic-update — button is disabled while in-flight.
 *    UI only updates after server confirms SUCCESS.
 *
 * On success → navigates to /orders/{orderId}/payment/success?paymentId={id}
 */
export function useProcessPayment(orderId: number, paymentId: number): UseProcessPaymentResult {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: () => processPayment(paymentId),
    onSuccess: (payment) => {
      router.push(`/orders/${orderId}/payment/success?paymentId=${payment.id}`);
    },
  });

  return {
    processCardPayment: () => mutation.mutate(),
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage:
      mutation.error instanceof Error
        ? mutation.error.message
        : "Failed to process card payment. Please try again.",
    payment: mutation.data,
  };
}
