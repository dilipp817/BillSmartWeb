import { useQuery } from "@tanstack/react-query";

import { getBill } from "../services/bill-service";
import type { BillDto } from "../types";

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseBillResult {
  bill: BillDto | undefined;
  isLoading: boolean;
  isError: boolean;
}

/**
 * useBill — query hook for fetching a single bill by ID.
 *
 * Used on screens that receive a billId via URL query param but don't already
 * hold the full BillDto in state (e.g. payment success screen for printing).
 */
export function useBill(billId: number | null): UseBillResult {
  const query = useQuery({
    queryKey: ["bills", billId],
    queryFn: () => getBill(billId!),
    enabled: billId !== null,
    staleTime: 5 * 60 * 1_000, // bill data doesn't change after payment — 5 min stale
  });

  return {
    bill: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
