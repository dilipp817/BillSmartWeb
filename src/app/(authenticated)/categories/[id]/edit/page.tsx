"use client";

import { use } from "react";

import { AlertCircle } from "lucide-react";
import Link from "next/link";

import { RoleGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/constants";
import { CategoryForm } from "@/features/menu/components/category-form";
import { useCategoryForm } from "@/features/menu/hooks/use-category-form";

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = use(params);
  const categoryId = Number(id);

  if (isNaN(categoryId) || categoryId <= 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <AlertCircle className="text-destructive size-8" />
        <p className="text-muted-foreground text-sm">Invalid category ID.</p>
        <Link href="/categories">
          <Button variant="outline" size="sm">
            Back to Categories
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <EditCategoryForm categoryId={categoryId} />
    </RoleGuard>
  );
}

function EditCategoryForm({ categoryId }: { categoryId: number }) {
  const vm = useCategoryForm({ mode: "edit", categoryId });

  return <CategoryForm vm={vm} title="Edit Category" />;
}
