"use client";

import { useQuery } from "@tanstack/react-query";

import { MAX_PAGE_SIZE } from "@/constants";
import { useAuthStore } from "@/store/use-auth-store";

import { listCategories } from "../services/category-service";
import { listFoods } from "../services/food-service";
import type { CategoryDto, FoodListItem, FoodPagination } from "../types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const FOOD_BROWSE_QUERY_KEY = ["menu", "foods"] as const;
export const CATEGORIES_QUERY_KEY = ["menu", "categories"] as const;

// ─── Filter state type ────────────────────────────────────────────────────────

export interface FoodBrowseFilters {
  search: string;
  categoryId: number | null;
  isVegetarian: boolean | null;
  isSpicy: boolean | null;
  offset: number;
  /** API sort string: "name:asc" | "price:asc" | "price:desc" | undefined (default) */
  sort?: string;
}

export const INITIAL_FOOD_BROWSE_FILTERS: FoodBrowseFilters = {
  search: "",
  categoryId: null,
  isVegetarian: null,
  isSpicy: null,
  offset: 0,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseFoodBrowseResult {
  foods: FoodListItem[];
  pagination: FoodPagination | undefined;
  categories: CategoryDto[];
  isFoodsLoading: boolean;
  isCategoriesLoading: boolean;
  isFoodsError: boolean;
  isCategoriesError: boolean;
}

/**
 * useFoodBrowse — fetches the paginated food list and categories for the
 * cashier's order-creation browse screen (O-05).
 *
 * - Foods: GET /api/v1/foods with filters. No polling — food menu rarely changes
 *   during service. Re-fetched when filters change.
 * - Categories: GET /api/v1/categories. Fetched once, stale after 5 minutes.
 *
 * The caller (FoodBrowseGrid) manages FoodBrowseFilters state and passes them here.
 */
export function useFoodBrowse(filters: FoodBrowseFilters): UseFoodBrowseResult {
  const restaurantId = useAuthStore((state) => state.restaurantId);

  const foodParams = {
    restaurant_id: restaurantId ?? 0,
    ...(filters.search.trim().length > 0 && { search: filters.search.trim() }),
    ...(filters.categoryId !== null && { category_id: filters.categoryId }),
    ...(filters.isVegetarian !== null && { is_vegetarian: filters.isVegetarian }),
    ...(filters.isSpicy !== null && { is_spicy: filters.isSpicy }),
    ...(filters.sort && { sort: filters.sort }),
    offset: filters.offset,
    limit: MAX_PAGE_SIZE,
  };

  const foodsQuery = useQuery({
    queryKey: [...FOOD_BROWSE_QUERY_KEY, restaurantId, foodParams],
    queryFn: () => listFoods(foodParams),
    enabled: restaurantId !== null,
    staleTime: 60_000, // 1 minute — menu doesn't change mid-service
  });

  const categoriesQuery = useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, restaurantId],
    queryFn: () => listCategories(restaurantId!),
    enabled: restaurantId !== null,
    staleTime: 5 * 60_000, // 5 minutes — categories change even less often
  });

  return {
    foods: foodsQuery.data?.data ?? [],
    pagination: foodsQuery.data?.pagination,
    categories: categoriesQuery.data ?? [],
    isFoodsLoading: foodsQuery.isLoading,
    isCategoriesLoading: categoriesQuery.isLoading,
    isFoodsError: foodsQuery.isError,
    isCategoriesError: categoriesQuery.isError,
  };
}
