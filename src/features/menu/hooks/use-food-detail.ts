"use client";

import { useQuery } from "@tanstack/react-query";

import { getFood } from "../services/food-service";
import type { FoodDetail } from "../types";

export const FOOD_DETAIL_QUERY_KEY = (foodId: number) => ["food", foodId] as const;

interface UseFoodDetailResult {
  food: FoodDetail | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function useFoodDetail(foodId: number): UseFoodDetailResult {
  const { data, isLoading, isError } = useQuery({
    queryKey: FOOD_DETAIL_QUERY_KEY(foodId),
    queryFn: () => getFood(foodId),
    enabled: foodId > 0,
    staleTime: Infinity, // food mutations explicitly invalidate this query
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status !== undefined && status >= 400 && status < 500) return false;
      return failureCount < 2;
    },
  });

  return { food: data, isLoading, isError };
}
