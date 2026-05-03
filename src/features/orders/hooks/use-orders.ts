"use client";

import { useQuery } from "@tanstack/react-query";

import { POLL_INTERVAL_ORDERS } from "@/constants";
import type { OrderStatus } from "@/constants";
import { useAuthStore } from "@/store/use-auth-store";

import { listActiveOrders, listOrders, listOrdersByStatus } from "../services/order-service";
import type { OrderDto, OrderListResponse } from "../types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const ORDERS_QUERY_KEY = ["orders"] as const;

export const ordersQueryKey = (
  restaurantId: number,
  filter: OrderStatus | "active" | "all",
  search: string
) => [...ORDERS_QUERY_KEY, restaurantId, filter, search] as const;

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseOrdersOptions {
  /** "all" | "active" | a specific OrderStatus */
  filter?: OrderStatus | "active" | "all";
  /** Debounced search string — empty string disables search mode */
  search?: string;
}

interface UseOrdersResult {
  orders: OrderListResponse["orders"];
  total: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * useOrders — fetches the order list for the authenticated restaurant.
 *
 * Behaviour:
 * - search takes priority over filter when non-empty
 * - filter="active" → GET /active
 * - filter=<OrderStatus> → GET /status/{status}
 * - filter="all" (default) → GET /
 * - Polls every POLL_INTERVAL_ORDERS (15 s)
 */
export function useOrders({ filter = "all", search = "" }: UseOrdersOptions = {}): UseOrdersResult {
  const restaurantId = useAuthStore((state) => state.restaurantId);

  const queryFn = (): Promise<OrderListResponse> => {
    if (restaurantId === null) {
      return Promise.reject(new Error("No restaurant ID in session"));
    }
    if (filter === "active") {
      return listActiveOrders(restaurantId);
    }
    if (filter !== "all") {
      return listOrdersByStatus(restaurantId, filter);
    }
    // "all" — list all orders
    return listOrders(restaurantId);
  };

  const { data, isLoading, isError, refetch } = useQuery<OrderListResponse>({
    queryKey: ordersQueryKey(restaurantId ?? 0, filter, ""),
    queryFn,
    enabled: restaurantId !== null,
    refetchInterval: POLL_INTERVAL_ORDERS,
    staleTime: POLL_INTERVAL_ORDERS,
  });

  const q = search.trim().toLowerCase();
  const filteredOrders: OrderDto[] = q
    ? (data?.orders ?? []).filter(
        (o) =>
          o.order_number.toLowerCase().includes(q) ||
          (o.table_number ?? "").toLowerCase().includes(q) ||
          o.status.toLowerCase().includes(q) ||
          o.order_type.toLowerCase().includes(q)
      )
    : (data?.orders ?? []);

  return {
    orders: filteredOrders,
    total: filteredOrders.length,
    isLoading,
    isError,
    refetch,
  };
}
