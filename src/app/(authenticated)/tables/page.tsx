"use client";

import Link from "next/link";

import { Settings2 } from "lucide-react";

import { RoleGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/constants";
import { useFeatureFlag } from "@/hooks/use-feature-flag";

import { TableStatusCard } from "@/features/tables/components/table-status-card";
import { useTableList } from "@/features/tables/hooks/use-table-list";
import { useUpdateTableStatus } from "@/features/tables/hooks/use-update-table-status";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function TableGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-card rounded-xl border-2 p-4">
          <div className="bg-muted h-5 w-1/2 animate-pulse rounded" />
          <div className="bg-muted mt-2 h-3 w-2/3 animate-pulse rounded" />
          <div className="bg-muted mt-1 h-3 w-1/2 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TablesPage() {
  const isEnabled = useFeatureFlag("is_table_management_enabled");
  const { tables, total, isLoading, isError } = useTableList();
  const { updateStatus, updatingTableId, updateError } = useUpdateTableStatus();

  // Feature flag — hide entirely when disabled
  if (!isEnabled) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tables</h1>
          {!isLoading && !isError && (
            <p className="text-muted-foreground mt-1 text-sm">
              {total} table{total !== 1 ? "s" : ""} total
            </p>
          )}
        </div>
        {/* Admin-only shortcut to Table Management (CRUD) */}
        <RoleGuard allowedRoles={[UserRole.ADMIN]}>
          <Link href="/tables/management">
            <Button variant="outline" size="sm">
              <Settings2 className="mr-1.5 size-3.5" />
              Manage Tables
            </Button>
          </Link>
        </RoleGuard>
      </div>

      {/* Loading */}
      {isLoading && <TableGridSkeleton />}

      {/* Fetch error */}
      {isError && !isLoading && (
        <div className="text-destructive rounded-lg border border-red-200 bg-red-50 p-4 text-sm">
          Failed to load tables. Please refresh the page.
        </div>
      )}

      {/* Status update error */}
      {updateError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {updateError}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && tables.length === 0 && (
        <div className="text-muted-foreground rounded-lg border border-dashed p-12 text-center text-sm">
          No tables have been added yet.
        </div>
      )}

      {/* Grid */}
      {!isLoading && !isError && tables.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {tables.map((table) => (
            <TableStatusCard
              key={table.id}
              table={table}
              onStatusChange={updateStatus}
              isUpdating={updatingTableId === table.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
