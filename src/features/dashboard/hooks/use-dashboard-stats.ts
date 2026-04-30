"use client";

import { useQuery } from "@tanstack/react-query";

import { POLL_INTERVAL_ORDERS } from "@/constants";
import { useAuthStore } from "@/store/use-auth-store";

import { getPendingOrderCount } from "../services/dashboard-service";
import type { DashboardStats } from "../types";

export const DASHBOARD_QUERY_KEY = ["dashboard", "stats"] as const;
export const PENDING_COUNT_QUERY_KEY = ["dashboard", "pendingCount"] as const;

/**
 * useDashboardStats — fetches stats shown on the Dashboard page.
 *
 * Currently wires:
 *  - pendingOrderCount via GET /restaurants/{rId}/orders/count/pending
 *
 * Placeholders (wired after O-02 is merged):
 *  - todayOrderCount
 *  - todayRevenue
 *
 * Polls every POLL_INTERVAL_ORDERS (15 s) so the pending badge stays live.
 */
export function useDashboardStats(): {
  stats: DashboardStats | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const restaurantId = useAuthStore((state) => state.restaurantId);

  const pendingQuery = useQuery({
    queryKey: [...PENDING_COUNT_QUERY_KEY, restaurantId],
    queryFn: () => getPendingOrderCount(restaurantId!),
    enabled: restaurantId !== null,
    refetchInterval: POLL_INTERVAL_ORDERS,
    staleTime: POLL_INTERVAL_ORDERS,
  });

  const stats: DashboardStats | undefined =
    pendingQuery.data !== undefined
      ? {
          pendingOrderCount: pendingQuery.data,
          todayOrderCount: null,
          todayRevenue: null,
        }
      : undefined;

  return {
    stats,
    isLoading: pendingQuery.isLoading,
    isError: pendingQuery.isError,
  };
}
