import { RoleGuard } from "@/components/role-guard";
import { UserRole } from "@/constants";

import { SalesReportView } from "@/features/reports/components/sales-report-view";

export default function ReportsPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.MANAGER, UserRole.ADMIN]}>
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sales Report</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Revenue and order summary for a selected date range.
          </p>
        </div>
        <SalesReportView />
      </div>
    </RoleGuard>
  );
}
