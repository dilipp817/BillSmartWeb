"use client";

import { useMutation } from "@tanstack/react-query";

import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/store/use-auth-store";
import type { OrderStatus } from "@/constants";

import { updateOrderStatus } from "../services/order-service";
import { orderDetailQueryKey } from "./use-order-detail";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseUpdateOrderStatusResult {
  /** Trigger a status transition. Button must be disabled while isPending. */
  updateStatus: (status: OrderStatus) => void;
  isPending: boolean;
  isError: boolean;
  errorMessage: string | null;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useUpdateOrderStatus — mutation hook for forward status transitions.
 *
 * Valid server-enforced transitions:
 *   PENDING      → IN_PROGRESS | HOLD
 *   IN_PROGRESS  → COMPLETED   | HOLD
 *   COMPLETED    → DELIVERED
 *   HOLD         → IN_PROGRESS
 *
 * Never optimistic — UI updates only after server confirms.
 * On success: invalidates orderDetailQueryKey so the detail page re-fetches.
 */
export function useUpdateOrderStatus(orderId: number): UseUpdateOrderStatusResult {
  const restaurantId = useAuthStore((state) => state.restaurantId);

  const mutation = useMutation({
    mutationFn: (status: OrderStatus) => {
      if (!restaurantId) throw new Error("No restaurant context");
      return updateOrderStatus(restaurantId, orderId, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orderDetailQueryKey(restaurantId ?? 0, orderId),
      });
    },
  });

  return {
    updateStatus: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage: mutation.isError
      ? ((mutation.error as Error)?.message ?? "Failed to update order status")
      : null,
  };
}
