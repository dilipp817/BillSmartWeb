"use client";

import { useState } from "react";

import Link from "next/link";

import { AlertCircle, Inbox, Plus } from "lucide-react";

import { RoleGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/constants";
import { DeleteFoodDialog } from "@/features/menu/components/delete-food-dialog";
import { MenuFilterBar } from "@/features/menu/components/menu-filter-bar";
import { MenuFoodRow } from "@/features/menu/components/menu-food-row";
import { useMenuManagement } from "@/features/menu/hooks/use-menu-management";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import type { FoodListItem } from "@/features/menu/types";

export default function MenuPage() {
  const {
    foods,
    pagination,
    categories,
    isFoodsLoading,
    isFoodsError,
    filters,
    setSearch,
    setCategoryId,
    goToPage,
    deleteFood,
    isDeleting,
    deletingFoodId,
  } = useMenuManagement();

  const [foodToDelete, setFoodToDelete] = useState<FoodListItem | null>(null);

  const handleDeleteConfirm = () => {
    if (foodToDelete === null) return;
    deleteFood(foodToDelete.id);
    setFoodToDelete(null);
  };

  const totalPages = pagination ? pagination.total_pages : 0;
  const currentPage = pagination ? pagination.current_page : 0;

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Menu</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {isFoodsLoading
                ? "Loading…"
                : `${pagination?.total ?? 0} item${pagination?.total !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Link href="/menu/new">
            <Button size="sm">
              <Plus className="size-4" />
              Add Food
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <MenuFilterBar
          search={filters.search}
          categoryId={filters.categoryId}
          categories={categories}
          onSearchChange={setSearch}
          onCategoryChange={setCategoryId}
        />

        {/* Error */}
        {isFoodsError && (
          <div className="text-destructive flex items-center gap-2 text-sm">
            <AlertCircle className="size-4 shrink-0" />
            <span>Could not load menu items. Please try refreshing.</span>
          </div>
        )}

        {/* Table */}
        {isFoodsLoading ? (
          <MenuTableSkeleton />
        ) : foods.length === 0 && !isFoodsError ? (
          <EmptyState search={filters.search} />
        ) : (
          <div className="rounded-xl border">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/50 border-b">
                    <th className="px-4 py-3 text-sm font-medium">Name</th>
                    <th className="px-4 py-3 text-sm font-medium">Category</th>
                    <th className="px-4 py-3 text-sm font-medium">Price</th>
                    <th className="px-4 py-3 text-sm font-medium">Status</th>
                    <th className="px-4 py-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map((food) => (
                    <MenuFoodRow
                      key={food.id}
                      food={food}
                      onDelete={setFoodToDelete}
                      isDeleting={isDeleting && deletingFoodId === food.id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Page {currentPage + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_previous}
                onClick={() => goToPage(Math.max(0, filters.offset - DEFAULT_PAGE_SIZE))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.has_next}
                onClick={() => goToPage(filters.offset + DEFAULT_PAGE_SIZE)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      {foodToDelete !== null && (
        <DeleteFoodDialog
          food={foodToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setFoodToDelete(null)}
          isDeleting={isDeleting}
        />
      )}
    </RoleGuard>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function MenuTableSkeleton() {
  return (
    <div className="rounded-xl border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b">
              {["Name", "Category", "Price", "Status", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-sm font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i} className="border-b last:border-0">
                {Array.from({ length: 5 }).map((__, j) => (
                  <td key={j} className="px-4 py-3">
                    <div className="bg-muted h-4 animate-pulse rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20">
      <Inbox className="text-muted-foreground size-10" />
      <p className="text-muted-foreground text-sm">
        {search.trim().length > 0
          ? `No food items match "${search}".`
          : "No food items yet. Add your first item to get started."}
      </p>
      {search.trim().length === 0 && (
        <Link href="/menu/new">
          <Button size="sm">
            <Plus className="size-4" />
            Add Food
          </Button>
        </Link>
      )}
    </div>
  );
}
