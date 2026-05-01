"use client";

import { use } from "react";

import { AlertCircle } from "lucide-react";
import Link from "next/link";

import { RoleGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/constants";
import { TableForm } from "@/features/tables/components/table-form";
import { useTableForm } from "@/features/tables/hooks/use-table-form";

interface EditTablePageProps {
  params: Promise<{ id: string }>;
}

export default function EditTablePage({ params }: EditTablePageProps) {
  const { id } = use(params);
  const tableId = Number(id);

  if (isNaN(tableId) || tableId <= 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <AlertCircle className="text-destructive size-8" />
        <p className="text-muted-foreground text-sm">Invalid table ID.</p>
        <Link href="/tables/management">
          <Button variant="outline" size="sm">
            Back to Table Management
          </Button>
        </Link>
      </div>
    );
  }

  return <EditTableContent tableId={tableId} />;
}

function EditTableContent({ tableId }: { tableId: number }) {
  const vm = useTableForm({ mode: "edit", tableId });

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <TableForm vm={vm} title="Edit Table" />
    </RoleGuard>
  );
}
