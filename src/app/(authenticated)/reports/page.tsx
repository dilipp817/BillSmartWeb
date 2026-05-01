import Link from "next/link";

import { ClipboardList } from "lucide-react";

import { RoleGuard } from "@/components/role-guard";
import { UserRole } from "@/constants";

import { SalesReportView } from "@/features/reports/components/sales-report-view";

export default function ReportsPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.MANAGER, UserRole.ADMIN]}>
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Sales Report</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Revenue and order summary for a selected date range.
            </p>
          </div>
          <Link
            href="/reports/history"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors"
          >
            <ClipboardList className="size-4" />
            Order History
          </Link>
        </div>
        <SalesReportView />
      </div>
    </RoleGuard>
  );
}
