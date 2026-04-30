"use client";

import { useMutation } from "@tanstack/react-query";

import { useAuthStore } from "@/store/use-auth-store";

import type { BillDto, GenerateBillParams } from "../types";
import { generateBill } from "../services/bill-service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseGenerateBillResult {
  /** Fire the generate-bill mutation with optional discount. */
  generate: (params?: GenerateBillParams) => void;
  isPending: boolean;
  isError: boolean;
  /** Human-readable error message for inline display. Never empty when isError is true. */
  errorMessage: string;
  /** The generated bill — defined only after a successful mutation. */
  bill: BillDto | undefined;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useGenerateBill — mutation hook for generating a bill from an order.
 *
 * Wraps POST /api/v1/restaurants/{restaurantId}/orders/{orderId}/generate-bill
 *
 * ⚠️ Never optimistic-update — bill breakdown is only shown after server confirms.
 * ⚠️ Discount is in rupees, not percent. Only MANAGER/ADMIN may use a non-zero value.
 *    Enforcement happens in the UI via RoleGuard — backend also validates.
 */
export function useGenerateBill(orderId: number): UseGenerateBillResult {
  const restaurantId = useAuthStore((state) => state.restaurantId);

  const mutation = useMutation({
    mutationFn: (params: GenerateBillParams = {}) => {
      if (!restaurantId) throw new Error("No restaurant context");
      return generateBill(restaurantId, orderId, params);
    },
  });

  return {
    generate: (params = {}) => mutation.mutate(params),
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage:
      mutation.error instanceof Error
        ? mutation.error.message
        : "Failed to generate bill. Please try again.",
    bill: mutation.data,
  };
}
