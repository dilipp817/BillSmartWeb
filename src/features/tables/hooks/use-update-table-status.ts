import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { type TableStatus } from "@/constants";
import { useAuthStore } from "@/store/use-auth-store";

import { updateTableStatus } from "../services/table-service";
import { TABLE_LIST_QUERY_KEY } from "./use-table-list";

// ─── Hook Result ──────────────────────────────────────────────────────────────

export interface UseUpdateTableStatusResult {
  /** Trigger a manual status transition for a table. Button must be disabled while isUpdating. */
  updateStatus: (tableId: number, newStatus: TableStatus) => void;
  isUpdating: boolean;
  /** ID of the table currently being updated — use to show per-card loading state. */
  updatingTableId: number | null;
  updateError: string | null;
}

/**
 * useUpdateTableStatus — mutation hook for manual table status transitions (T-05).
 *
 * One shared mutation instance for the whole /tables grid. Invalidates
 * TABLE_LIST_QUERY_KEY on success so the grid refreshes with the new status.
 *
 * Never optimistic — UI only updates after server confirms.
 *
 * Layer: Hook (state + logic — no JSX, no direct API calls)
 */
export function useUpdateTableStatus(): UseUpdateTableStatusResult {
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const queryClient = useQueryClient();

  const [updatingTableId, setUpdatingTableId] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: ({ tableId, newStatus }: { tableId: number; newStatus: TableStatus }) => {
      if (!restaurantId) throw new Error("No restaurant context");
      setUpdatingTableId(tableId);
      return updateTableStatus(restaurantId, tableId, newStatus);
    },
    onSuccess: () => {
      setUpdatingTableId(null);
      queryClient.invalidateQueries({ queryKey: [...TABLE_LIST_QUERY_KEY, restaurantId] });
    },
    onError: () => {
      setUpdatingTableId(null);
    },
  });

  const updateError = mutation.error
    ? (mutation.error as Error).message || "Failed to update table status."
    : null;

  return {
    updateStatus: (tableId, newStatus) => mutation.mutate({ tableId, newStatus }),
    isUpdating: mutation.isPending,
    updatingTableId,
    updateError,
  };
}
