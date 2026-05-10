"use client";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DEFAULT_PAGE_SIZE } from "@/constants";
import { useAuthStore } from "@/store/use-auth-store";

import { listCategories } from "../services/category-service";
import { deleteFood, listFoods } from "../services/food-service";
import type { CategoryDto, FoodListItem, FoodPagination } from "../types";
import { CATEGORIES_QUERY_KEY, FOOD_BROWSE_QUERY_KEY } from "./use-food-browse";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const MENU_MANAGEMENT_QUERY_KEY = ["menu", "management", "foods"] as const;

// ─── Filter State ─────────────────────────────────────────────────────────────

export interface MenuManagementFilters {
  search: string;
  categoryId: number | null;
  offset: number;
}

export const INITIAL_MENU_FILTERS: MenuManagementFilters = {
  search: "",
  categoryId: null,
  offset: 0,
};

// ─── Hook Result ──────────────────────────────────────────────────────────────

interface UseMenuManagementResult {
  foods: FoodListItem[];
  pagination: FoodPagination | undefined;
  categories: CategoryDto[];
  isFoodsLoading: boolean;
  isCategoriesLoading: boolean;
  isFoodsError: boolean;
  filters: MenuManagementFilters;
  setSearch: (search: string) => void;
  setCategoryId: (categoryId: number | null) => void;
  goToPage: (offset: number) => void;
  deleteFood: (foodId: number) => void;
  isDeleting: boolean;
  deletingFoodId: number | null;
}

/**
 * useMenuManagement — state + data for the Menu Management screen (M-04).
 *
 * - Fetches paginated food list with search and category filters.
 * - Fetches category list for the filter dropdown.
 * - Exposes a deleteFood mutation that soft-deletes a food item and
 *   invalidates both the management list and the food-browse cache.
 *
 * Layer: Hook (state + logic — no JSX, no direct API calls)
 */
export function useMenuManagement(): UseMenuManagementResult {
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState<MenuManagementFilters>(INITIAL_MENU_FILTERS);
  const [deletingFoodId, setDeletingFoodId] = useState<number | null>(null);

  // ── Food list query ──────────────────────────────────────────────────────────
  const foodParams = {
    restaurant_id: restaurantId ?? 0,
    ...(filters.search.trim().length > 0 && { search: filters.search.trim() }),
    ...(filters.categoryId !== null && { category_id: filters.categoryId }),
    offset: filters.offset,
    limit: DEFAULT_PAGE_SIZE,
  };

  const foodsQuery = useQuery({
    queryKey: [...MENU_MANAGEMENT_QUERY_KEY, restaurantId, foodParams],
    queryFn: () => listFoods(foodParams),
    enabled: restaurantId !== null,
  });

  // ── Categories query ─────────────────────────────────────────────────────────
  const categoriesQuery = useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, restaurantId],
    queryFn: () => listCategories(restaurantId!),
    enabled: restaurantId !== null,
    staleTime: Infinity, // category mutations explicitly invalidate this query
  });

  // ── Delete mutation ──────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (foodId: number) => {
      setDeletingFoodId(foodId);
      return deleteFood(foodId);
    },
    onSuccess: () => {
      // Invalidate both the management list and the cashier food-browse cache
      queryClient.invalidateQueries({ queryKey: MENU_MANAGEMENT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOOD_BROWSE_QUERY_KEY });
    },
    onSettled: () => {
      setDeletingFoodId(null);
    },
  });

  // ── Filter helpers ───────────────────────────────────────────────────────────
  const setSearch = (search: string) => setFilters((prev) => ({ ...prev, search, offset: 0 }));

  const setCategoryId = (categoryId: number | null) =>
    setFilters((prev) => ({ ...prev, categoryId, offset: 0 }));

  const goToPage = (offset: number) => setFilters((prev) => ({ ...prev, offset }));

  return {
    foods: foodsQuery.data?.data ?? [],
    pagination: foodsQuery.data?.pagination,
    categories: categoriesQuery.data ?? [],
    isFoodsLoading: foodsQuery.isLoading,
    isCategoriesLoading: categoriesQuery.isLoading,
    isFoodsError: foodsQuery.isError,
    filters,
    setSearch,
    setCategoryId,
    goToPage,
    deleteFood: (foodId) => deleteMutation.mutate(foodId),
    isDeleting: deleteMutation.isPending,
    deletingFoodId,
  };
}
