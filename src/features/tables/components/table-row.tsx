import Link from "next/link";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TableStatus } from "@/constants";

import type { TableDto } from "../types";

// ─── Status badge config ──────────────────────────────────────────────────────

const STATUS_LABEL: Record<TableStatus, string> = {
  [TableStatus.AVAILABLE]: "Available",
  [TableStatus.OCCUPIED]: "Occupied",
  [TableStatus.RESERVED]: "Reserved",
  [TableStatus.CLEANING]: "Cleaning",
  [TableStatus.MAINTENANCE]: "Maintenance",
};

const STATUS_CLASS: Record<TableStatus, string> = {
  [TableStatus.AVAILABLE]: "bg-green-100 text-green-800",
  [TableStatus.OCCUPIED]: "bg-red-100 text-red-700",
  [TableStatus.RESERVED]: "bg-blue-100 text-blue-800",
  [TableStatus.CLEANING]: "bg-yellow-100 text-yellow-800",
  [TableStatus.MAINTENANCE]: "bg-gray-200 text-gray-700",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface TableRowProps {
  table: TableDto;
  onDelete: (table: TableDto) => void;
  isDeleting: boolean;
}

/**
 * TableRow — one row in the Table Management list (T-04).
 *
 * Shows table number, floor, capacity, status badge, and edit/delete actions.
 */
export function TableRow({ table, onDelete, isDeleting }: TableRowProps) {
  return (
    <tr className="hover:bg-muted/50 border-b transition-colors last:border-0">
      {/* Table Number */}
      <td className="px-4 py-3">
        <span className="text-sm font-medium">T{table.table_number}</span>
      </td>

      {/* Floor */}
      <td className="text-muted-foreground px-4 py-3 text-sm">Floor {table.floor}</td>

      {/* Capacity */}
      <td className="px-4 py-3 text-sm">
        {table.capacity} seat{table.capacity !== 1 ? "s" : ""}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASS[table.status] ?? STATUS_CLASS[TableStatus.AVAILABLE]}`}
        >
          {STATUS_LABEL[table.status] ?? table.status}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Link href={`/tables/management/${table.id}/edit`}>
            <Button variant="ghost" size="icon-sm" aria-label={`Edit table ${table.table_number}`}>
              <Pencil className="size-3.5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete table ${table.table_number}`}
            onClick={() => onDelete(table)}
            disabled={isDeleting}
          >
            <Trash2 className="text-destructive size-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
