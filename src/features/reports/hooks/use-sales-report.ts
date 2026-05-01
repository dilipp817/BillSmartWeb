import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/store/use-auth-store";

import { computeSalesReport, getOrdersInRange } from "../services/report-service";
import type { SalesReportData } from "../types";

// ─── Query Key ────────────────────────────────────────────────────────────────

export const SALES_REPORT_QUERY_KEY = ["reports", "sales"] as const;

// ─── Date helpers ─────────────────────────────────────────────────────────────

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function getDefaultRange(): { startDate: string; endDate: string } {
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 6);
  return { startDate: toIsoDate(weekAgo), endDate: toIsoDate(today) };
}

// ─── Hook Result ──────────────────────────────────────────────────────────────

export interface UseSalesReportResult {
  report: SalesReportData | undefined;
  isLoading: boolean;
  isError: boolean;
  startDate: string;
  endDate: string;
  setDateRange: (startDate: string, endDate: string) => void;
}

/**
 * useSalesReport — fetches and aggregates the sales report for a date range.
 *
 * The backend returns raw orders from GET /orders/range; client-side
 * computeSalesReport() produces headline totals, daily summary, and
 * order-type breakdown.
 *
 * Defaults to the last 7 days on mount. The query re-runs automatically
 * whenever startDate or endDate changes.
 *
 * Layer: Hook (state + logic — no JSX, no direct API calls)
 */
export function useSalesReport(): UseSalesReportResult {
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const defaultRange = getDefaultRange();

  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);

  const {
    data: report,
    isLoading,
    isError,
  } = useQuery<SalesReportData>({
    queryKey: [...SALES_REPORT_QUERY_KEY, restaurantId, startDate, endDate],
    queryFn: async () => {
      const params = { start_date: startDate, end_date: endDate };
      const raw = await getOrdersInRange(restaurantId!, params);
      return computeSalesReport(raw, params);
    },
    enabled: restaurantId !== null,
    staleTime: 0, // Always re-fetch when date range changes
  });

  function setDateRange(newStart: string, newEnd: string) {
    setStartDate(newStart);
    setEndDate(newEnd);
  }

  return { report, isLoading, isError, startDate, endDate, setDateRange };
}
