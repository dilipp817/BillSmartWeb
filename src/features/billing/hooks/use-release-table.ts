"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { TableStatus } from "@/constants";
import { useAuthStore } from "@/store/use-auth-store";

import { updateTableStatus } from "../../tables/services/table-service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseReleaseTableResult {
  /** PATCH table status → AVAILABLE */
  releaseTable: () => void;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  /** Human-readable error for inline display. Never empty when isError is true. */
  errorMessage: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useReleaseTable — mutation hook for releasing a table after successful payment (B-08).
 *
 * Calls PATCH /api/v1/restaurants/{restaurantId}/tables/{tableId}/status?new_status=AVAILABLE
 *
 * ⚠️ This is a best-effort UX action — even if it fails the payment is still
 *    confirmed. The error is shown inline; failure does NOT affect the payment record.
 *
 * The button is only rendered when:
 *   1. The is_table_management_enabled feature flag is true
 *   2. tableId is present in the URL (i.e. a DINE_IN order with a table assigned)
 *
 * On success → invalidates the tables query so T-03 (table list) reflects the change.
 */
export function useReleaseTable(tableId: number): UseReleaseTableResult {
  const restaurantId = useAuthStore((s) => s.restaurantId);
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => {
      if (!restaurantId) {
        throw new Error("Restaurant ID not available. Please log in again.");
      }
      return updateTableStatus(restaurantId, tableId, TableStatus.AVAILABLE);
    },
    onSuccess: () => {
      // Invalidate table list queries so any polling table grid reflects the release
      queryClient.invalidateQueries({ queryKey: ["tables", restaurantId] });
    },
  });

  return {
    releaseTable: () => mutation.mutate(),
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    errorMessage:
      mutation.error instanceof Error
        ? mutation.error.message
        : "Failed to release table. Please update it manually.",
  };
}
