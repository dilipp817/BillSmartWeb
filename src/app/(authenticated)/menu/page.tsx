"use client";

import { useState } from "react";

import Link from "next/link";

import { AlertCircle, Inbox, Plus } from "lucide-react";

import { RoleGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/constants";
import { DeleteFoodDialog } from "@/features/menu/components/delete-food-dialog";
import { MenuFilterBar } from "@/features/menu/components/menu-filter-bar";
import { MenuFoodCard } from "@/features/menu/components/menu-food-card";
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

        {/* Grid */}
        {isFoodsLoading ? (
          <MenuGridSkeleton />
        ) : foods.length === 0 && !isFoodsError ? (
          <EmptyState search={filters.search} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {foods.map((food) => (
              <MenuFoodCard
                key={food.id}
                food={food}
                onDelete={setFoodToDelete}
                isDeleting={isDeleting && deletingFoodId === food.id}
              />
            ))}
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

function MenuGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-card ring-foreground/10 flex flex-col rounded-xl p-4 ring-1">
          <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
          <div className="bg-muted mt-2 h-3 w-1/2 animate-pulse rounded" />
          <div className="bg-muted mt-3 h-5 w-1/3 animate-pulse rounded" />
          <div className="bg-muted mt-2 h-5 w-16 animate-pulse rounded-full" />
          <div className="mt-3 flex gap-2 border-t pt-3">
            <div className="bg-muted h-8 flex-1 animate-pulse rounded" />
            <div className="bg-muted h-8 w-8 animate-pulse rounded" />
          </div>
        </div>
      ))}
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
