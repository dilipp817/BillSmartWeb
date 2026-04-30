"use client";

import { AlertCircle, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { useFeatureFlag } from "@/hooks/use-feature-flag";

import { useAvailableTables } from "../hooks/use-available-tables";
import type { AvailableTableDto } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TableSelectionGridProps {
  /** Currently selected table ID, or null if none selected */
  selectedTableId: number | null;
  /** Called when the user clicks an available table card */
  onSelect: (table: AvailableTableDto) => void;
  /** Optional minimum capacity filter passed to the hook */
  minCapacity?: number;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * TableSelectionGrid — shows all AVAILABLE tables as selectable cards.
 *
 * Feature-flagged: if `is_table_management_enabled` is false, renders nothing.
 * The caller (CreateOrder flow) should treat a null-render as TAKEAWAY mode —
 * no table_id should be sent with the order.
 *
 * Polls every POLL_INTERVAL_TABLES (30 s) via useAvailableTables.
 */
export function TableSelectionGrid({
  selectedTableId,
  onSelect,
  minCapacity,
  className,
}: TableSelectionGridProps) {
  const isTableManagementEnabled = useFeatureFlag("is_table_management_enabled");

  // If flag is off → hide entirely. Caller treats order as TAKEAWAY.
  if (!isTableManagementEnabled) {
    return null;
  }

  return (
    <TableSelectionGridInner
      selectedTableId={selectedTableId}
      onSelect={onSelect}
      minCapacity={minCapacity}
      className={className}
    />
  );
}

// ─── Inner component (only rendered when flag is on) ──────────────────────────

interface InnerProps extends TableSelectionGridProps {
  minCapacity?: number;
}

function TableSelectionGridInner({
  selectedTableId,
  onSelect,
  minCapacity,
  className,
}: InnerProps) {
  const { tables, isLoading, isError } = useAvailableTables({ minCapacity });

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-10", className)}>
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className={cn("text-destructive flex items-center gap-2 text-sm", className)}>
        <AlertCircle className="size-4 shrink-0" />
        <span>Could not load available tables. Please retry.</span>
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <p className={cn("text-muted-foreground py-6 text-center text-sm", className)}>
        No tables available at the moment.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
        className
      )}
    >
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          isSelected={table.id === selectedTableId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

// ─── Table Card ───────────────────────────────────────────────────────────────

interface TableCardProps {
  table: AvailableTableDto;
  isSelected: boolean;
  onSelect: (table: AvailableTableDto) => void;
}

function TableCard({ table, isSelected, onSelect }: TableCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(table)}
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border p-4 transition-colors",
        isSelected
          ? "border-primary bg-primary/10 text-primary ring-primary ring-2"
          : "border-border hover:bg-muted text-foreground"
      )}
    >
      <span className="text-lg font-semibold">{table.table_number}</span>
      <span className="text-muted-foreground mt-0.5 text-xs">
        {table.capacity} seat{table.capacity !== 1 ? "s" : ""}
      </span>
    </button>
  );
}
