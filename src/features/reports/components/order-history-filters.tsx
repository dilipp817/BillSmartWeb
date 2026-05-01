"use client";

import { OrderStatus } from "@/constants";
import { Input } from "@/components/ui/input";

const STATUS_OPTIONS: Array<{ value: OrderStatus | "all"; label: string }> = [
  { value: "all", label: "All Statuses" },
  { value: OrderStatus.PENDING, label: "Pending" },
  { value: OrderStatus.IN_PROGRESS, label: "In Progress" },
  { value: OrderStatus.HOLD, label: "Hold" },
  { value: OrderStatus.COMPLETED, label: "Completed" },
  { value: OrderStatus.DELIVERED, label: "Delivered" },
  { value: OrderStatus.CANCELLED, label: "Cancelled" },
];

interface OrderHistoryFiltersProps {
  statusFilter: OrderStatus | "all";
  searchQuery: string;
  onStatusChange: (status: OrderStatus | "all") => void;
  onSearchChange: (query: string) => void;
}

/**
 * OrderHistoryFilters — status select + search text input for the order history log.
 * Search takes priority: when search is non-empty, the status filter has no effect
 * (the search endpoint returns across all statuses).
 */
export function OrderHistoryFilters({
  statusFilter,
  searchQuery,
  onStatusChange,
  onSearchChange,
}: OrderHistoryFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        type="search"
        placeholder="Search order number, table…"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="sm:w-64"
      />
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value as OrderStatus | "all")}
        disabled={searchQuery.trim().length > 0}
        className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-9 rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-44"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {searchQuery.trim().length > 0 && (
        <p className="text-muted-foreground text-xs">Status filter disabled while searching.</p>
      )}
    </div>
  );
}
