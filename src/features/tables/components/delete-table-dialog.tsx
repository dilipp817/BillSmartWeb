"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { TableDto } from "../types";

interface DeleteTableDialogProps {
  table: TableDto;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

/**
 * DeleteTableDialog — inline confirmation panel before hard-deleting a table.
 *
 * ⚠️ Table delete is a HARD delete. Occupied tables (with a current order) cannot
 * be deleted — the backend will reject with 409. The dialog warns accordingly.
 */
export function DeleteTableDialog({
  table,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteTableDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-table-title"
      className="bg-background fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
    >
      <div className="bg-background w-full max-w-sm rounded-xl border p-6 shadow-lg">
        <div className="mb-4 flex items-start gap-3">
          <AlertTriangle className="text-destructive mt-0.5 size-5 shrink-0" />
          <div>
            <h2 id="delete-table-title" className="text-base font-semibold">
              Delete Table &ldquo;{table.table_number}&rdquo;?
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              This will permanently delete the table. Tables that are currently occupied cannot be
              deleted.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
