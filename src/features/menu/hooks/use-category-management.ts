"use client";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "@/store/use-auth-store";

import { deleteCategory as deleteCategoryApi, listCategories } from "../services/category-service";
import type { CategoryDto } from "../types";
import { CATEGORIES_QUERY_KEY } from "./use-food-browse";

// ─── Query Key ────────────────────────────────────────────────────────────────

export const CATEGORY_MANAGEMENT_QUERY_KEY = ["menu", "management", "categories"] as const;

// ─── Hook Result ──────────────────────────────────────────────────────────────

export interface UseCategoryManagementResult {
  categories: CategoryDto[];
  isLoading: boolean;
  isError: boolean;
  deleteCategory: (categoryId: number) => void;
  isDeleting: boolean;
  deletingCategoryId: number | null;
  deleteError: string | null;
}

/**
 * useCategoryManagement — state + data for the Category Management screen (M-06).
 *
 * - Fetches the full category list for the restaurant.
 * - Exposes a deleteCategory mutation (hard-delete) that invalidates both the
 *   management list and the food-browse category cache.
 *
 * Layer: Hook (state + logic — no JSX, no direct API calls)
 */
export function useCategoryManagement(): UseCategoryManagementResult {
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const queryClient = useQueryClient();

  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);

  const categoriesQuery = useQuery({
    queryKey: [...CATEGORY_MANAGEMENT_QUERY_KEY, restaurantId],
    queryFn: () => listCategories(restaurantId!),
    enabled: restaurantId !== null,
  });

  const deleteMutation = useMutation({
    mutationFn: (categoryId: number) => {
      setDeletingCategoryId(categoryId);
      return deleteCategoryApi(categoryId);
    },
    onSuccess: () => {
      setDeletingCategoryId(null);
      queryClient.invalidateQueries({ queryKey: CATEGORY_MANAGEMENT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
    },
    onError: () => {
      setDeletingCategoryId(null);
    },
  });

  const deleteError = deleteMutation.error
    ? (deleteMutation.error as Error).message || "Failed to delete category."
    : null;

  return {
    categories: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    deleteCategory: (categoryId) => deleteMutation.mutate(categoryId),
    isDeleting: deleteMutation.isPending,
    deletingCategoryId,
    deleteError,
  };
}
