"use client";

import { useState } from "react";

import { AlertCircle, Flame, Leaf, Search } from "lucide-react";

import { DEFAULT_PAGE_SIZE } from "@/constants";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import {
  INITIAL_FOOD_BROWSE_FILTERS,
  useFoodBrowse,
  type FoodBrowseFilters,
} from "../hooks/use-food-browse";
import type { FoodListItem } from "../types";
import { FoodCard } from "./food-card";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FoodBrowseGridProps {
  /** Called when the cashier taps + on a food card */
  onAddToCart: (food: FoodListItem) => void;
  /** Map of foodId → quantity currently in cart, for selection state */
  cartQuantities?: Record<number, number>;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * FoodBrowseGrid — paginated food grid with category filter, search,
 * and veg / spicy toggles.
 *
 * Used by the Create Order flow (O-07). Manages its own filter state internally;
 * surfaces only the selected food via onAddToCart.
 */
export function FoodBrowseGrid({ onAddToCart, cartQuantities, className }: FoodBrowseGridProps) {
  const [filters, setFilters] = useState<FoodBrowseFilters>(INITIAL_FOOD_BROWSE_FILTERS);

  const { foods, pagination, categories, isFoodsLoading, isCategoriesLoading, isFoodsError } =
    useFoodBrowse(filters);

  // ── Filter helpers ─────────────────────────────────────────────────────────

  const setSearch = (search: string) => setFilters((prev) => ({ ...prev, search, offset: 0 }));

  const setCategory = (categoryId: number | null) =>
    setFilters((prev) => ({ ...prev, categoryId, offset: 0 }));

  const toggleVegetarian = () =>
    setFilters((prev) => ({
      ...prev,
      isVegetarian: prev.isVegetarian === true ? null : true,
      offset: 0,
    }));

  const toggleSpicy = () =>
    setFilters((prev) => ({
      ...prev,
      isSpicy: prev.isSpicy === true ? null : true,
      offset: 0,
    }));

  const goToPage = (newOffset: number) => setFilters((prev) => ({ ...prev, offset: newOffset }));

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            type="search"
            placeholder="Search food…"
            value={filters.search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Veg / Spicy toggles */}
        <div className="flex items-center gap-2">
          <ToggleChip
            active={filters.isVegetarian === true}
            onClick={toggleVegetarian}
            icon={<Leaf className="size-3.5" />}
            label="Veg"
            activeClass="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          />
          <ToggleChip
            active={filters.isSpicy === true}
            onClick={toggleSpicy}
            icon={<Flame className="size-3.5" />}
            label="Spicy"
            activeClass="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
          />
        </div>
      </div>

      {/* ── Category tabs ──────────────────────────────────────────────────── */}
      {!isCategoriesLoading && categories.length > 0 && (
        <div className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
          <button
            type="button"
            onClick={() => setCategory(null)}
            className={
              filters.categoryId === null
                ? "bg-primary text-primary-foreground shrink-0 rounded-full px-3 py-1.5 text-sm font-medium"
                : "text-muted-foreground hover:bg-muted shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors"
            }
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={
                filters.categoryId === cat.id
                  ? "bg-primary text-primary-foreground shrink-0 rounded-full px-3 py-1.5 text-sm font-medium"
                  : "text-muted-foreground hover:bg-muted shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors"
              }
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {isFoodsError && (
        <div className="text-destructive flex items-center gap-2 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          <span>Could not load food items. Please try again.</span>
        </div>
      )}

      {/* ── Food grid ─────────────────────────────────────────────────────── */}
      {isFoodsLoading ? (
        <FoodGridSkeleton />
      ) : foods.length === 0 && !isFoodsError ? (
        <p className="text-muted-foreground py-10 text-center text-sm">No items found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {foods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onAdd={onAddToCart}
              quantity={cartQuantities?.[food.id]}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {pagination.total} item{pagination.total !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!pagination.has_previous}
              onClick={() => goToPage(filters.offset - DEFAULT_PAGE_SIZE)}
              className="hover:bg-muted disabled:text-muted-foreground rounded-md px-3 py-1.5 transition-colors disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!pagination.has_next}
              onClick={() => goToPage(filters.offset + DEFAULT_PAGE_SIZE)}
              className="hover:bg-muted disabled:text-muted-foreground rounded-md px-3 py-1.5 transition-colors disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FoodGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-card ring-foreground/10 rounded-xl p-4 ring-1">
          <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
          <div className="bg-muted mt-1.5 h-3 w-1/2 animate-pulse rounded" />
          <div className="mt-4 flex items-center justify-between">
            <div className="bg-muted h-5 w-16 animate-pulse rounded" />
            <div className="bg-muted size-8 animate-pulse rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ToggleChip ───────────────────────────────────────────────────────────────

interface ToggleChipProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  activeClass: string;
}

function ToggleChip({ active, onClick, icon, label, activeClass }: ToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
        active ? activeClass : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
