"use client";

import { useQuery } from "@tanstack/react-query";

import { POLL_INTERVAL_TABLES } from "@/constants";
import { useAuthStore } from "@/store/use-auth-store";

import { listTables } from "../services/table-service";
import type { TableDto, TableListResponse } from "../types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const TABLE_LIST_QUERY_KEY = ["tables", "all"] as const;

// ─── Hook Result ──────────────────────────────────────────────────────────────

export interface UseTableListResult {
  tables: TableDto[];
  total: number;
  isLoading: boolean;
  isError: boolean;
}

/**
 * useTableList — fetches all tables for the restaurant, polling every 30s.
 *
 * Used by the Table List (Operational) screen (T-03) to show a live status grid.
 * TanStack Query refetchInterval drives the 30s poll; refetchOnWindowFocus
 * ensures the grid refreshes whenever the cashier tabs back to this screen.
 *
 * Layer: Hook (state + logic — no JSX, no direct API calls)
 */
export function useTableList(): UseTableListResult {
  const restaurantId = useAuthStore((state) => state.restaurantId);

  const { data, isLoading, isError } = useQuery<TableListResponse>({
    queryKey: [...TABLE_LIST_QUERY_KEY, restaurantId],
    queryFn: () => listTables(restaurantId!),
    enabled: restaurantId !== null,
    refetchInterval: POLL_INTERVAL_TABLES,
    staleTime: POLL_INTERVAL_TABLES,
    refetchOnWindowFocus: true,
  });

  return {
    tables: data?.tables ?? [],
    total: data?.total ?? 0,
    isLoading,
    isError,
  };
}
