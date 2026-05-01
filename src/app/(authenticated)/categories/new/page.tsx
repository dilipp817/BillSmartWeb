"use client";

import { RoleGuard } from "@/components/role-guard";
import { UserRole } from "@/constants";
import { CategoryForm } from "@/features/menu/components/category-form";
import { useCategoryForm } from "@/features/menu/hooks/use-category-form";

export default function AddCategoryPage() {
  const vm = useCategoryForm({ mode: "add" });

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <CategoryForm vm={vm} title="Add Category" />
    </RoleGuard>
  );
}
