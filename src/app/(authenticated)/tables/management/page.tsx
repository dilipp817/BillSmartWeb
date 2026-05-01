"use client";

import { useState } from "react";

import Link from "next/link";

import { AlertCircle, Inbox, Plus } from "lucide-react";

import { RoleGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/constants";
import { DeleteTableDialog } from "@/features/tables/components/delete-table-dialog";
import { TableRow } from "@/features/tables/components/table-row";
import { useTableManagement } from "@/features/tables/hooks/use-table-management";
import type { TableDto } from "@/features/tables/types";

export default function TableManagementPage() {
  const {
    tables,
    total,
    isLoading,
    isError,
    deleteTable,
    isDeleting,
    deletingTableId,
    deleteError,
  } = useTableManagement();

  const [tableToDelete, setTableToDelete] = useState<TableDto | null>(null);

  const handleDeleteConfirm = () => {
    if (tableToDelete === null) return;
    deleteTable(tableToDelete.id);
    setTableToDelete(null);
  };

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Table Management</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {isLoading ? "Loading…" : `${total} table${total !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Link href="/tables/management/new">
            <Button size="sm">
              <Plus className="mr-1.5 size-3.5" />
              Add Table
            </Button>
          </Link>
        </div>

        {/* Delete error toast */}
        {deleteError && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            <AlertCircle className="size-4 shrink-0" />
            {deleteError}
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-muted h-12 animate-pulse rounded-lg" />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="text-destructive flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
            <AlertCircle className="size-4 shrink-0" />
            Failed to load tables. Please refresh the page.
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && tables.length === 0 && (
          <div className="text-muted-foreground flex flex-col items-center gap-2 rounded-lg border border-dashed p-12 text-center">
            <Inbox className="size-8" />
            <p className="text-sm">No tables yet. Add your first table to get started.</p>
          </div>
        )}

        {/* Table list */}
        {!isLoading && !isError && tables.length > 0 && (
          <div className="rounded-xl border">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="text-muted-foreground px-4 py-2.5 text-xs font-medium tracking-wide uppercase">
                    Table
                  </th>
                  <th className="text-muted-foreground px-4 py-2.5 text-xs font-medium tracking-wide uppercase">
                    Floor
                  </th>
                  <th className="text-muted-foreground px-4 py-2.5 text-xs font-medium tracking-wide uppercase">
                    Capacity
                  </th>
                  <th className="text-muted-foreground px-4 py-2.5 text-xs font-medium tracking-wide uppercase">
                    Status
                  </th>
                  <th className="text-muted-foreground px-4 py-2.5 text-xs font-medium tracking-wide uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tables.map((table) => (
                  <TableRow
                    key={table.id}
                    table={table}
                    onDelete={setTableToDelete}
                    isDeleting={isDeleting && deletingTableId === table.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {tableToDelete !== null && (
        <DeleteTableDialog
          table={tableToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setTableToDelete(null)}
          isDeleting={isDeleting}
        />
      )}
    </RoleGuard>
  );
}
