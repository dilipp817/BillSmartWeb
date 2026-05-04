"use client";

import { useQuery } from "@tanstack/react-query";

import { OrderStatus, POLL_INTERVAL_ORDERS } from "@/constants";
import { listOrdersByDateRange } from "@/features/orders/services/order-service";
import { useAuthStore } from "@/store/use-auth-store";

import { getPendingOrderCount } from "../services/dashboard-service";
import type { DashboardStats } from "../types";

export const DASHBOARD_QUERY_KEY = ["dashboard", "stats"] as const;
export const PENDING_COUNT_QUERY_KEY = ["dashboard", "pendingCount"] as const;
export const TODAY_STATS_QUERY_KEY = ["dashboard", "todayStats"] as const;

/**
 * useDashboardStats — fetches stats shown on the Dashboard page.
 *
 * Wires:
 *  - pendingOrderCount via GET /restaurants/{rId}/orders/count/pending
 *  - todayOrderCount and todayRevenue via GET /restaurants/{rId}/orders/range
 *
 * Polls every POLL_INTERVAL_ORDERS (15 s) so all stats stay live.
 */
export function useDashboardStats(): {
  stats: DashboardStats | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const restaurantId = useAuthStore((state) => state.restaurantId);
  // Use local date (not UTC) so "today" matches the restaurant's timezone
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const pendingQuery = useQuery({
    queryKey: [...PENDING_COUNT_QUERY_KEY, restaurantId],
    queryFn: () => getPendingOrderCount(restaurantId!),
    enabled: restaurantId !== null,
    refetchInterval: POLL_INTERVAL_ORDERS,
    staleTime: POLL_INTERVAL_ORDERS,
  });

  const todayQuery = useQuery({
    queryKey: [...TODAY_STATS_QUERY_KEY, restaurantId, today],
    queryFn: () => listOrdersByDateRange(restaurantId!, today, today),
    enabled: restaurantId !== null,
    refetchInterval: POLL_INTERVAL_ORDERS,
    staleTime: POLL_INTERVAL_ORDERS,
    // Do not retry on 4xx client errors — the backend may not support this date format
    // yet; retrying would flood the server on every poll cycle.
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } }).response?.status;
      if (status !== undefined && status >= 400 && status < 500) return false;
      return failureCount < 2;
    },
  });

  const stats: DashboardStats | undefined =
    pendingQuery.data !== undefined
      ? {
          pendingOrderCount: pendingQuery.data,
          todayOrderCount: todayQuery.isError ? null : (todayQuery.data?.total ?? null),
          todayRevenue: todayQuery.isError
            ? null
            : (todayQuery.data?.orders
                .filter((o) => o.status !== OrderStatus.CANCELLED)
                .reduce((sum, o) => sum + o.total_amount, 0) ?? null),
        }
      : undefined;

  return {
    stats,
    isLoading: pendingQuery.isLoading || todayQuery.isLoading,
    isError: pendingQuery.isError,
  };
}
