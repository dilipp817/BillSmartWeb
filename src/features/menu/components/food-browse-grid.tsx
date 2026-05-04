"use client";

import { useState } from "react";

import { AlertCircle, ArrowDownUp, Flame, Leaf, Search } from "lucide-react";

import { MAX_PAGE_SIZE } from "@/constants";
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

type SortKey = "default" | "name" | "price_asc" | "price_desc";

const SORT_OPTIONS: { key: SortKey; label: string; apiValue?: string }[] = [
  { key: "default", label: "Default" },
  { key: "name", label: "A → Z", apiValue: "name:asc" },
  { key: "price_asc", label: "Price ↑", apiValue: "price:asc" },
  { key: "price_desc", label: "Price ↓", apiValue: "price:desc" },
];

interface FoodBrowseGridProps {
  /** Called when the cashier taps + on a food card */
  onAddToCart: (food: FoodListItem) => void;
  /** Called when the cashier taps − on a food card (quantity goes to 0 → removed). Optional — omit when the grid is used outside a cart context. */
  onRemoveFromCart?: (food: FoodListItem) => void;
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
export function FoodBrowseGrid({
  onAddToCart,
  onRemoveFromCart = () => {},
  cartQuantities,
  className,
}: FoodBrowseGridProps) {
  const [filters, setFilters] = useState<FoodBrowseFilters>(INITIAL_FOOD_BROWSE_FILTERS);

  const { foods, pagination, categories, isFoodsLoading, isCategoriesLoading, isFoodsError } =
    useFoodBrowse(filters);

  // Filter inactive categories client-side — backend returns all, per mobile master §7
  const activeCategories = categories.filter((c) => c.is_active);

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

  const setSort = (key: SortKey) => {
    const apiValue = SORT_OPTIONS.find((o) => o.key === key)?.apiValue;
    setFilters((prev) => ({ ...prev, sort: apiValue, offset: 0 }));
  };

  // Derive current SortKey from the API sort string stored in filters
  const currentSortKey: SortKey =
    filters.sort === "name:asc"
      ? "name"
      : filters.sort === "price:asc"
        ? "price_asc"
        : filters.sort === "price:desc"
          ? "price_desc"
          : "default";

  const goToPage = (newOffset: number) => setFilters((prev) => ({ ...prev, offset: newOffset }));

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className={cn("relative flex flex-col gap-4", className)}>
      {/* ── Row 1: Search + diet toggles + sort ───────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search — grows to fill available width */}
        <div className="relative min-w-0 flex-1">
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

      {/* ── Category tabs ──────────────────────────────────────────────────── */}
      {!isCategoriesLoading && activeCategories.length > 0 && (
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
          {activeCategories.map((cat) => (
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

      {/* ── Food grid (grouped by category) ───────────────────────────────── */}
      {isFoodsLoading ? (
        <FoodGridSkeleton />
      ) : foods.length === 0 && !isFoodsError ? (
        <p className="text-muted-foreground py-10 text-center text-sm">No items found.</p>
      ) : filters.categoryId !== null ? (
        // Single category selected — no header needed, flat grid
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {foods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onAdd={onAddToCart}
              onRemove={onRemoveFromCart}
              quantity={cartQuantities?.[food.id]}
            />
          ))}
        </div>
      ) : (
        // "All" — group by category_name with bold section headers
        <FoodGroupedGrid
          foods={foods}
          onAddToCart={onAddToCart}
          onRemoveFromCart={onRemoveFromCart}
          cartQuantities={cartQuantities}
        />
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
              onClick={() => goToPage(filters.offset - MAX_PAGE_SIZE)}
              className="hover:bg-muted disabled:text-muted-foreground rounded-md px-3 py-1.5 transition-colors disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!pagination.has_next}
              onClick={() => goToPage(filters.offset + MAX_PAGE_SIZE)}
              className="hover:bg-muted disabled:text-muted-foreground rounded-md px-3 py-1.5 transition-colors disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── Floating sort button ──────────────────────────────────────────── */}
      <SortFloatingButton currentSortKey={currentSortKey} onSort={setSort} />
    </div>
  );
}

// ─── Grouped Grid ────────────────────────────────────────────────────────────

interface FoodGroupedGridProps {
  foods: FoodListItem[];
  onAddToCart: (food: FoodListItem) => void;
  onRemoveFromCart: (food: FoodListItem) => void;
  cartQuantities?: Record<number, number>;
}

function FoodGroupedGrid({
  foods,
  onAddToCart,
  onRemoveFromCart,
  cartQuantities,
}: FoodGroupedGridProps) {
  // Preserve backend order while grouping by category_name
  const groups: { categoryName: string; items: FoodListItem[] }[] = [];
  const seen = new Map<string, FoodListItem[]>();

  for (const food of foods) {
    const name = food.category_name ?? "Uncategorised";
    if (!seen.has(name)) {
      const arr: FoodListItem[] = [];
      seen.set(name, arr);
      groups.push({ categoryName: name, items: arr });
    }
    seen.get(name)!.push(food);
  }

  return (
    <div className="space-y-6">
      {groups.map(({ categoryName, items }) => (
        <section key={categoryName}>
          <h3 className="text-muted-foreground mb-3 text-xs font-semibold tracking-widest uppercase">
            {categoryName}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onAdd={onAddToCart}
                onRemove={onRemoveFromCart}
                quantity={cartQuantities?.[food.id]}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function FoodGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-card ring-foreground/10 overflow-hidden rounded-xl ring-1">
          <div className="bg-muted h-28 w-full animate-pulse" />
          <div className="p-3">
            <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
            <div className="mt-3 flex items-center justify-between">
              <div className="bg-muted h-5 w-16 animate-pulse rounded" />
              <div className="bg-muted size-8 animate-pulse rounded-full" />
            </div>
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

// ─── Sort Floating Button ─────────────────────────────────────────────────────

interface SortFloatingButtonProps {
  currentSortKey: SortKey;
  onSort: (key: SortKey) => void;
}

/**
 * Floating sort button — renders at bottom-center of the food browse panel.
 * Shows current sort label; opens an inline popover with all sort options on click.
 * Matches the Android POS "floating sort" pattern.
 */
function SortFloatingButton({ currentSortKey, onSort }: SortFloatingButtonProps) {
  const [open, setOpen] = useState(false);
  const currentLabel = SORT_OPTIONS.find((o) => o.key === currentSortKey)?.label ?? "Default";

  return (
    <div className="pointer-events-none sticky bottom-4 flex justify-center">
      <div className="pointer-events-auto relative">
        {/* Sort options popover — opens upward */}
        {open && (
          <div className="bg-popover text-popover-foreground absolute bottom-full left-1/2 mb-2 w-36 -translate-x-1/2 overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  onSort(opt.key);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-4 py-2.5 text-sm transition-colors",
                  opt.key === currentSortKey
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Trigger pill */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-md transition-all",
            currentSortKey !== "default"
              ? "bg-primary text-primary-foreground"
              : "bg-card text-foreground ring-1 ring-black/10"
          )}
        >
          <ArrowDownUp className="size-3.5" />
          Sort: {currentLabel}
        </button>
      </div>
    </div>
  );
}
