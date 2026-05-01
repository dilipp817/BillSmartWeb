"use client";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/store/use-auth-store";

import { deleteTable as deleteTableApi, listTables } from "../services/table-service";
import type { TableDto } from "../types";
import { TABLE_LIST_QUERY_KEY } from "./use-table-list";

// ─── Hook Result ──────────────────────────────────────────────────────────────

export interface UseTableManagementResult {
  tables: TableDto[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  deleteTable: (tableId: number) => void;
  isDeleting: boolean;
  deletingTableId: number | null;
  deleteError: string | null;
}

/**
 * useTableManagement — state + data for the Table Management (CRUD) screen (T-04).
 *
 * - Fetches all tables for the restaurant (no polling — admin management view).
 * - Exposes a deleteTable mutation that invalidates TABLE_LIST_QUERY_KEY on success.
 *
 * Layer: Hook (state + logic — no JSX, no direct API calls)
 */
export function useTableManagement(): UseTableManagementResult {
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const queryClient = useQueryClient();

  const [deletingTableId, setDeletingTableId] = useState<number | null>(null);

  const tablesQuery = useQuery({
    queryKey: [...TABLE_LIST_QUERY_KEY, restaurantId],
    queryFn: () => listTables(restaurantId!),
    enabled: restaurantId !== null,
  });

  const deleteMutation = useMutation({
    mutationFn: (tableId: number) => {
      if (!restaurantId) throw new Error("No restaurant context");
      setDeletingTableId(tableId);
      return deleteTableApi(restaurantId, tableId);
    },
    onSuccess: () => {
      setDeletingTableId(null);
      queryClient.invalidateQueries({ queryKey: [...TABLE_LIST_QUERY_KEY, restaurantId] });
    },
    onError: () => {
      setDeletingTableId(null);
    },
  });

  const deleteError = deleteMutation.error
    ? (deleteMutation.error as Error).message || "Failed to delete table."
    : null;

  return {
    tables: tablesQuery.data?.tables ?? [],
    total: tablesQuery.data?.total ?? 0,
    isLoading: tablesQuery.isLoading,
    isError: tablesQuery.isError,
    deleteTable: (tableId) => deleteMutation.mutate(tableId),
    isDeleting: deleteMutation.isPending,
    deletingTableId,
    deleteError,
  };
}
