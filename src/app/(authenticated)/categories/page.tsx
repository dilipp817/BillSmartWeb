"use client";

import { useState } from "react";

import Link from "next/link";

import { AlertCircle, Inbox, Plus } from "lucide-react";

import { RoleGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/constants";
import { CategoryRow } from "@/features/menu/components/category-row";
import { DeleteCategoryDialog } from "@/features/menu/components/delete-category-dialog";
import { useCategoryManagement } from "@/features/menu/hooks/use-category-management";
import type { CategoryDto } from "@/features/menu/types";

export default function CategoriesPage() {
  const {
    categories,
    isLoading,
    isError,
    deleteCategory,
    isDeleting,
    deletingCategoryId,
    deleteError,
  } = useCategoryManagement();

  const [categoryToDelete, setCategoryToDelete] = useState<CategoryDto | null>(null);

  const handleDeleteConfirm = () => {
    if (categoryToDelete === null) return;
    deleteCategory(categoryToDelete.id);
    setCategoryToDelete(null);
  };

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Categories</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {isLoading
                ? "Loading…"
                : `${categories.length} categor${categories.length !== 1 ? "ies" : "y"}`}
            </p>
          </div>
          <Link href="/categories/new">
            <Button size="sm">
              <Plus className="size-4" />
              Add Category
            </Button>
          </Link>
        </div>

        {/* Delete error */}
        {deleteError && (
          <div role="alert" className="text-destructive flex items-center gap-2 text-sm">
            <AlertCircle className="size-4 shrink-0" />
            <span>{deleteError}</span>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-destructive flex items-center gap-2 text-sm">
            <AlertCircle className="size-4 shrink-0" />
            <span>Could not load categories. Please try refreshing.</span>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted h-12 animate-pulse rounded-lg" />
            ))}
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && categories.length > 0 && (
          <div className="rounded-lg border">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 border-b text-left text-xs font-medium tracking-wide uppercase">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <CategoryRow
                    key={category.id}
                    category={category}
                    onDelete={setCategoryToDelete}
                    isDeleting={isDeleting && deletingCategoryId === category.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && categories.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16">
            <Inbox className="text-muted-foreground size-10" />
            <p className="text-muted-foreground text-sm">No categories yet.</p>
            <Link href="/categories/new">
              <Button size="sm" variant="outline">
                Add your first category
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      {categoryToDelete && (
        <DeleteCategoryDialog
          category={categoryToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setCategoryToDelete(null)}
          isDeleting={isDeleting}
        />
      )}
    </RoleGuard>
  );
}
