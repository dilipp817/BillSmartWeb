import { TableStatus } from "@/constants";

import type { TableDto } from "../types";

interface TableStatusCardProps {
  table: TableDto;
}

const STATUS_STYLES: Record<
  TableStatus,
  { bg: string; border: string; badge: string; label: string }
> = {
  [TableStatus.AVAILABLE]: {
    bg: "bg-green-50",
    border: "border-green-300",
    badge: "bg-green-100 text-green-800",
    label: "Available",
  },
  [TableStatus.OCCUPIED]: {
    bg: "bg-red-50",
    border: "border-red-300",
    badge: "bg-red-100 text-red-700",
    label: "Occupied",
  },
  [TableStatus.RESERVED]: {
    bg: "bg-blue-50",
    border: "border-blue-300",
    badge: "bg-blue-100 text-blue-800",
    label: "Reserved",
  },
  [TableStatus.CLEANING]: {
    bg: "bg-yellow-50",
    border: "border-yellow-300",
    badge: "bg-yellow-100 text-yellow-800",
    label: "Cleaning",
  },
  [TableStatus.MAINTENANCE]: {
    bg: "bg-gray-100",
    border: "border-gray-300",
    badge: "bg-gray-200 text-gray-700",
    label: "Maintenance",
  },
};

/**
 * TableStatusCard — visual card for a single table in the operational grid (T-03).
 *
 * Shows table number, floor, capacity, current status, and current order ID
 * (when occupied). Colour-coded by status. Read-only — no actions on T-03.
 */
export function TableStatusCard({ table }: TableStatusCardProps) {
  const style = STATUS_STYLES[table.status] ?? STATUS_STYLES[TableStatus.AVAILABLE];

  return (
    <div
      className={`rounded-xl border-2 p-4 transition-colors ${style.bg} ${style.border}`}
      aria-label={`Table ${table.table_number} — ${style.label}`}
    >
      {/* Table number */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-lg leading-tight font-bold">T{table.table_number}</span>
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${style.badge}`}
        >
          {style.label}
        </span>
      </div>

      {/* Details */}
      <div className="text-muted-foreground mt-2 space-y-0.5 text-xs">
        <p>Floor {table.floor}</p>
        <p>
          {table.capacity} seat{table.capacity !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Order ID when occupied */}
      {table.current_order_id !== null && (
        <p className="mt-2 text-xs font-medium text-red-700">Order #{table.current_order_id}</p>
      )}
    </div>
  );
}
