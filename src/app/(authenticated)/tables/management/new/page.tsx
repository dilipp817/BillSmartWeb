"use client";

import { RoleGuard } from "@/components/role-guard";
import { UserRole } from "@/constants";
import { TableForm } from "@/features/tables/components/table-form";
import { useTableForm } from "@/features/tables/hooks/use-table-form";

export default function AddTablePage() {
  const vm = useTableForm({ mode: "add" });

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <TableForm vm={vm} title="Add Table" />
    </RoleGuard>
  );
}
