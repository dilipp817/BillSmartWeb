import { useEffect, useState } from "react";

import type { OrderStatus } from "@/constants";
import { useOrders } from "@/features/orders/hooks/use-orders";
import type { OrderDto } from "@/features/orders/types";

// ─── Hook Result ──────────────────────────────────────────────────────────────

export interface UseOrderHistoryResult {
  orders: OrderDto[];
  total: number;
  isLoading: boolean;
  isError: boolean;
  statusFilter: OrderStatus | "all";
  setStatusFilter: (status: OrderStatus | "all") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

/**
 * useOrderHistory — full order log with status filter + debounced search.
 *
 * Wraps useOrders, adding local UI state for the filter and search inputs.
 * Search is debounced 400 ms so the API is not called on every keystroke.
 *
 * Layer: Hook (state + logic — no JSX, no direct API calls)
 */
export function useOrderHistory(): UseOrderHistoryResult {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // 400 ms debounce — avoids firing the search endpoint on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { orders, total, isLoading, isError } = useOrders({
    filter: debouncedSearch.trim().length > 0 ? "all" : statusFilter,
    search: debouncedSearch,
  });

  return {
    orders,
    total,
    isLoading,
    isError,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
  };
}
