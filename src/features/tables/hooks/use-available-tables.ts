"use client";

import { useQuery } from "@tanstack/react-query";

import { POLL_INTERVAL_TABLES } from "@/constants";
import { useAuthStore } from "@/store/use-auth-store";

import { listAvailableTables } from "../services/table-service";
import type { AvailableTableDto } from "../types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const AVAILABLE_TABLES_QUERY_KEY = ["tables", "available"] as const;

export const availableTablesQueryKey = (restaurantId: number, minCapacity?: number) =>
  [...AVAILABLE_TABLES_QUERY_KEY, restaurantId, minCapacity ?? null] as const;

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseAvailableTablesOptions {
  /** Optional minimum seat capacity filter */
  minCapacity?: number;
}

interface UseAvailableTablesResult {
  tables: AvailableTableDto[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * useAvailableTables — fetches the list of AVAILABLE tables for the current restaurant.
 *
 * - Polls every POLL_INTERVAL_TABLES (30 s) so the grid stays fresh while
 *   the cashier is choosing a table.
 * - Disabled when no restaurantId is in the session.
 * - Optionally filters by minimum capacity.
 *
 * This hook is used by TableSelectionGrid (O-04) and should only be rendered
 * when is_table_management_enabled flag is true — the component handles that guard.
 */
export function useAvailableTables({
  minCapacity,
}: UseAvailableTablesOptions = {}): UseAvailableTablesResult {
  const restaurantId = useAuthStore((state) => state.restaurantId);

  const { data, isLoading, isError, refetch } = useQuery<AvailableTableDto[]>({
    queryKey: availableTablesQueryKey(restaurantId ?? 0, minCapacity),
    queryFn: () => listAvailableTables(restaurantId!, minCapacity),
    enabled: restaurantId !== null,
    refetchInterval: POLL_INTERVAL_TABLES,
    staleTime: POLL_INTERVAL_TABLES,
  });

  return {
    tables: data ?? [],
    isLoading,
    isError,
    refetch,
  };
}
