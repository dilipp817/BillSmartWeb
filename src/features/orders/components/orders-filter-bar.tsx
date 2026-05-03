"use client";

import { Search } from "lucide-react";

import { OrderStatus } from "@/constants";
import { Input } from "@/components/ui/input";

// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderFilter = OrderStatus | "active" | "all";

interface OrdersFilterBarProps {
  activeFilter: OrderFilter;
  search: string;
  onFilterChange: (filter: OrderFilter) => void;
  onSearchChange: (value: string) => void;
}

// ─── Filter tab config ────────────────────────────────────────────────────────

interface FilterTab {
  value: OrderFilter;
  label: string;
}

const FILTER_TABS: FilterTab[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: OrderStatus.PENDING, label: "Pending" },
  { value: OrderStatus.IN_PROGRESS, label: "In Progress" },
  { value: OrderStatus.HOLD, label: "Hold" },
  { value: OrderStatus.COMPLETED, label: "Completed" },
  { value: OrderStatus.DELIVERED, label: "Delivered" },
  { value: OrderStatus.CANCELLED, label: "Cancelled" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function OrdersFilterBar({
  activeFilter,
  search,
  onFilterChange,
  onSearchChange,
}: OrdersFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onFilterChange(tab.value)}
            className={
              activeFilter === tab.value
                ? "bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium"
                : "text-muted-foreground hover:bg-muted rounded-md px-3 py-1.5 text-sm transition-colors"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-64">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder="Search by order #, table, status…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}
