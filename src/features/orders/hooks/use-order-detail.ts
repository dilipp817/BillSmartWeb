"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/store/use-auth-store";
import type { FoodListItem } from "@/features/menu/types";

import type { OrderDto } from "../types";
import {
  addOrderItem,
  cancelOrder as cancelOrderService,
  getOrder,
} from "../services/order-service";
import { ORDERS_QUERY_KEY } from "./use-orders";

// ─── Query Key ────────────────────────────────────────────────────────────────

export const orderDetailQueryKey = (restaurantId: number, orderId: number) =>
  [...ORDERS_QUERY_KEY, restaurantId, orderId] as const;

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseOrderDetailResult {
  order: OrderDto | undefined;
  isLoading: boolean;
  isError: boolean;
  /** Add a food item (qty 1) to the order. Only valid when status is PENDING or HOLD. */
  addItem: (food: FoodListItem) => void;
  isAddingItem: boolean;
  /** Cancel the order. Manager/admin only — backend enforces role. Navigates to /orders on success. */
  cancelOrder: () => void;
  isCancelling: boolean;
}

/**
 * useOrderDetail — fetches a single order by ID.
 *
 * Exposes two mutations:
 *   - addItem: POST /{orderId}/items — add a food to the order
 *   - cancelOrder: DELETE /{orderId} — cancel, then navigate to /orders
 *
 * Neither mutation is optimistic — UI updates only after server confirms.
 * No polling — detail page is navigated to directly after create.
 */
export function useOrderDetail(orderId: number): UseOrderDetailResult {
  const router = useRouter();
  const restaurantId = useAuthStore((state) => state.restaurantId);

  // ── Query ────────────────────────────────────────────────────────────────────
  const query = useQuery({
    queryKey: orderDetailQueryKey(restaurantId ?? 0, orderId),
    queryFn: () => {
      if (!restaurantId) throw new Error("No restaurant context");
      return getOrder(restaurantId, orderId);
    },
    enabled: restaurantId !== null,
  });

  // ── Add item mutation ────────────────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: (food: FoodListItem) => {
      if (!restaurantId) throw new Error("No restaurant context");
      return addOrderItem(restaurantId, orderId, { food_id: food.id, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orderDetailQueryKey(restaurantId ?? 0, orderId),
      });
    },
  });

  // ── Cancel mutation ──────────────────────────────────────────────────────────
  const cancelMutation = useMutation({
    mutationFn: () => {
      if (!restaurantId) throw new Error("No restaurant context");
      return cancelOrderService(restaurantId, orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      router.push("/orders");
    },
  });

  return {
    order: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    addItem: (food) => addMutation.mutate(food),
    isAddingItem: addMutation.isPending,
    cancelOrder: () => cancelMutation.mutate(),
    isCancelling: cancelMutation.isPending,
  };
}
