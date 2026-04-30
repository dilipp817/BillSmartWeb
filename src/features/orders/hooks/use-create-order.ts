"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/store/use-auth-store";
import { toCreateOrderItems, useCartStore } from "@/store/use-cart-store";

import { createOrder } from "../services/order-service";
import { ORDERS_QUERY_KEY } from "./use-orders";

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseCreateOrderResult {
  /**
   * Submit the current cart as a new order.
   * Optionally pass a free-text notes string (e.g. "Window seat please").
   * Does nothing if the cart is empty or restaurantId is not available.
   */
  submitOrder: (notes?: string) => void;
  isPending: boolean;
  isError: boolean;
  errorMessage: string | null;
}

/**
 * useCreateOrder — TanStack Query mutation that creates a new order from the
 * current cart state.
 *
 * On success:
 *   1. Clears the cart (Zustand)
 *   2. Invalidates all order queries so the list refreshes
 *   3. Navigates to the order detail page `/orders/{id}`
 *
 * The Place Order button must be disabled while isPending is true to prevent
 * double submissions (financial safety rule — never optimistic).
 */
export function useCreateOrder(): UseCreateOrderResult {
  const router = useRouter();
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const { items, tableId, orderType, clearCart } = useCartStore();

  const mutation = useMutation({
    mutationFn: (notes: string | undefined) => {
      if (!restaurantId) {
        throw new Error("No restaurant context — cannot create order.");
      }
      return createOrder(restaurantId, {
        table_id: tableId,
        order_type: orderType,
        items: toCreateOrderItems(items),
        ...(notes?.trim() && { notes: notes.trim() }),
      });
    },
    onSuccess: (order) => {
      clearCart();
      // Invalidate all order queries so the order list reflects the new order
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      router.push(`/orders/${order.id}`);
    },
  });

  const submitOrder = (notes?: string) => {
    if (items.length === 0 || !restaurantId || mutation.isPending) return;
    mutation.mutate(notes);
  };

  const errorMessage = mutation.isError ? "Failed to place order. Please try again." : null;

  return {
    submitOrder,
    isPending: mutation.isPending,
    isError: mutation.isError,
    errorMessage,
  };
}
