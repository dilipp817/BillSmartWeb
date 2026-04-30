"use client";

import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { useRouter } from "next/navigation";

import { PaymentMethod } from "@/constants";
import { generatePaymentRef } from "@/utils/payment-ref";

import type { CreatePaymentRequest, PaymentDto } from "../types";
import { createPayment } from "../services/payment-service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RecordPaymentParams {
  /** Amount tendered by the customer. */
  amount: number;
  paymentMethod: PaymentMethod;
  /** For CASH: change returned to customer. Default 0. */
  changeAmount?: number;
}

interface UseRecordPaymentResult {
  /** Fire the create-payment mutation. reference_number is generated internally. */
  recordPayment: (params: RecordPaymentParams) => void;
  isPending: boolean;
  isError: boolean;
  /** Human-readable error for inline display. Never empty when isError is true. */
  errorMessage: string;
  /** The created payment — defined only after a successful mutation. */
  payment: PaymentDto | undefined;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useRecordPayment — mutation hook for recording a payment.
 *
 * ⚠️ reference_number is generated with generatePaymentRef() ONCE on the first
 *    mutate call and stored in a useRef so retries always send the same value.
 *    The same value is forwarded as X-Idempotency-Key by payment-service.ts.
 *
 * auto_process logic:
 *   CASH / UPI / WALLET → auto_process = true  (immediately SUCCESS)
 *   CARD               → auto_process = false (stays PENDING until B-06 processes)
 *
 * ⚠️ Never optimistic-update — payment/bill UI updates only after server confirms.
 *
 * On CASH/UPI/WALLET success → navigates to /orders/{orderId}/payment/success?paymentId={id}
 * On CARD success (PENDING)  → navigates to /orders/{orderId}/payment/card?paymentId={id} (B-06)
 */
export function useRecordPayment(orderId: number, billId?: number): UseRecordPaymentResult {
  const router = useRouter();

  // Persisted across renders via useRef — generated once, reused on retry.
  const referenceNumberRef = useRef<string | null>(null);

  const mutation = useMutation({
    mutationFn: (params: RecordPaymentParams) => {
      // Generate reference_number BEFORE the network call — persist across retries.
      if (!referenceNumberRef.current) {
        referenceNumberRef.current = generatePaymentRef();
      }

      const isAutoProcess =
        params.paymentMethod === PaymentMethod.CASH ||
        params.paymentMethod === PaymentMethod.UPI ||
        params.paymentMethod === PaymentMethod.WALLET;

      const request: CreatePaymentRequest = {
        order_id: orderId,
        bill_id: billId,
        amount: params.amount,
        payment_method: params.paymentMethod,
        reference_number: referenceNumberRef.current,
        auto_process: isAutoProcess,
        change_amount: params.changeAmount ?? 0,
      };

      return createPayment(request);
    },
    onSuccess: (payment) => {
      const billQuery = payment.bill_id ? `&billId=${payment.bill_id}` : "";
      if (payment.status === "SUCCESS") {
        // CASH / UPI / WALLET — immediately paid
        router.push(`/orders/${orderId}/payment/success?paymentId=${payment.id}${billQuery}`);
      } else {
        // CARD — PENDING, hand off to B-06 card flow
        router.push(`/orders/${orderId}/payment/card?paymentId=${payment.id}${billQuery}`);
      }
    },
  });

  return {
    recordPayment: (params) => mutation.mutate(params),
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage:
      mutation.error instanceof Error
        ? mutation.error.message
        : "Payment failed. Please try again.",
    payment: mutation.data,
  };
}
