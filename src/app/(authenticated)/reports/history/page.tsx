"use client";

import Link from "next/link";

import { BarChart3 } from "lucide-react";

import { RoleGuard } from "@/components/role-guard";
import { UserRole } from "@/constants";
import { useFeatureFlag } from "@/hooks/use-feature-flag";

import { OrderHistoryFilters } from "@/features/reports/components/order-history-filters";
import { OrderHistoryTable } from "@/features/reports/components/order-history-table";
import { useOrderHistory } from "@/features/reports/hooks/use-order-history";

function OrderHistoryContent() {
  const isEnabled = useFeatureFlag("is_sales_reports_enabled");
  const {
    orders,
    total,
    isLoading,
    isError,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
  } = useOrderHistory();

  if (!isEnabled) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <OrderHistoryFilters
        statusFilter={statusFilter}
        searchQuery={searchQuery}
        onStatusChange={setStatusFilter}
        onSearchChange={setSearchQuery}
      />

      {/* Error */}
      {isError && (
        <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm">
          Failed to load orders. Please try again.
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="rounded-xl border">
          <div className="bg-muted/50 h-10 border-b" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-b px-4 py-3 last:border-0">
              <div className="bg-muted h-4 w-32 animate-pulse rounded" />
              <div className="bg-muted h-4 w-16 animate-pulse rounded" />
              <div className="bg-muted h-4 w-20 animate-pulse rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Result count */}
      {!isLoading && !isError && (
        <p className="text-muted-foreground text-sm">
          {total} order{total !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Table */}
      {!isLoading && <OrderHistoryTable orders={orders} />}
    </div>
  );
}

export default function OrderHistoryPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.MANAGER, UserRole.ADMIN]}>
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Order History</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Full order log — filter by status or search by order number.
            </p>
          </div>
          <Link
            href="/reports"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
          >
            <BarChart3 className="size-4" />
            Sales Report
          </Link>
        </div>

        <OrderHistoryContent />
      </div>
    </RoleGuard>
  );
}
