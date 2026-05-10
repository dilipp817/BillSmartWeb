"use client";

import { useEffect } from "react";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type Resolver, useForm } from "react-hook-form";

import { useAuthStore } from "@/store/use-auth-store";

import { listCategories } from "../services/category-service";
import { createFood, getFood, updateFood } from "../services/food-service";
import type { CategoryDto, CreateFoodRequest, UpdateFoodRequest } from "../types";
import { CATEGORIES_QUERY_KEY, FOOD_BROWSE_QUERY_KEY } from "./use-food-browse";
import { FOOD_DETAIL_QUERY_KEY } from "./use-food-detail";
import { MENU_MANAGEMENT_QUERY_KEY } from "./use-menu-management";
import { foodFormSchema, type FoodFormValues } from "../utils/food-form-schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FoodFormMode = "add" | "edit";

export interface UseFoodFormResult {
  form: ReturnType<typeof useForm<FoodFormValues>>;
  categories: CategoryDto[];
  isCategoriesLoading: boolean;
  isLoadingFood: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  mode: FoodFormMode;
  onSubmit: (values: FoodFormValues) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseFoodFormOptions {
  mode: FoodFormMode;
  /** Required when mode === "edit" */
  foodId?: number;
}

/**
 * useFoodForm — ViewModel for the Add/Edit Food form (M-05).
 *
 * - "add" mode: submits POST /api/v1/foods/restaurant/{restaurantId}, then
 *   navigates back to /menu/management.
 * - "edit" mode: fetches food detail via GET /api/v1/foods/{id}, populates the
 *   form, then submits PUT /api/v1/foods/{id} on save (admin only).
 *
 * Layer: Hook (state + logic — no JSX, no direct API calls)
 */
export function useFoodForm({ mode, foodId }: UseFoodFormOptions): UseFoodFormResult {
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<FoodFormValues>({
    // Cast needed: z.coerce.number() has input type `unknown` which causes a
    // contravariance mismatch with standardSchemaResolver's generic inference.
    // The cast is safe — the resolver correctly validates and coerces the fields.
    resolver: standardSchemaResolver(foodFormSchema) as Resolver<FoodFormValues>,
    defaultValues: {
      name: "",
      price: undefined,
      category_id: undefined,
      is_vegetarian: false,
      is_spicy: false,
      description: "",
      image_url: "",
    },
  });

  // ── Categories ───────────────────────────────────────────────────────────────
  const categoriesQuery = useQuery({
    queryKey: [...CATEGORIES_QUERY_KEY, restaurantId],
    queryFn: () => listCategories(restaurantId!),
    enabled: restaurantId !== null,
    staleTime: Infinity, // category mutations explicitly invalidate this query
  });

  // ── Edit mode: fetch food detail and populate form ───────────────────────────
  const foodDetailQuery = useQuery({
    queryKey: ["menu", "foods", "detail", foodId],
    queryFn: () => getFood(foodId!),
    enabled: mode === "edit" && foodId !== undefined,
  });

  useEffect(() => {
    if (mode === "edit" && foodDetailQuery.data) {
      const f = foodDetailQuery.data;
      form.reset({
        name: f.name,
        price: f.price,
        category_id: f.category_id,
        is_vegetarian: f.is_vegetarian,
        is_spicy: f.is_spicy,
        description: f.description ?? "",
        image_url: f.image_url ?? "",
      });
    }
  }, [mode, foodDetailQuery.data, form]);

  // ── Add mode: create mutation ────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateFoodRequest) => {
      if (!restaurantId) throw new Error("No restaurant context");
      return createFood(restaurantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_MANAGEMENT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOOD_BROWSE_QUERY_KEY });
      router.push("/menu/management");
    },
  });

  // ── Edit mode: update mutation ───────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (data: UpdateFoodRequest) => {
      if (!foodId) throw new Error("No food ID");
      return updateFood(foodId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MENU_MANAGEMENT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOOD_BROWSE_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: FOOD_DETAIL_QUERY_KEY(foodId!) });
      router.push(`/menu/${foodId}`);
    },
  });

  // ── Submit handler ───────────────────────────────────────────────────────────
  function onSubmit(values: FoodFormValues) {
    if (mode === "edit") {
      if (!foodId || !restaurantId) throw new Error("No food or restaurant context");
      const request: UpdateFoodRequest = {
        name: values.name,
        price: values.price,
        restaurant_id: restaurantId,
        category_id: values.category_id,
        is_vegetarian: values.is_vegetarian,
        is_spicy: values.is_spicy,
        description: values.description?.trim() || null,
        image_url: values.image_url || null,
      };
      updateMutation.mutate(request);
      return;
    }

    const request: CreateFoodRequest = {
      name: values.name,
      price: values.price,
      category_id: values.category_id,
      is_vegetarian: values.is_vegetarian,
      is_spicy: values.is_spicy,
      ...(values.description?.trim() && { description: values.description.trim() }),
      image_url: values.image_url || null,
    };
    createMutation.mutate(request);
  }

  const activeError = mode === "edit" ? updateMutation.error : createMutation.error;
  const submitError = activeError
    ? (activeError as Error).message || "Failed to save food item."
    : null;

  return {
    form,
    categories: categoriesQuery.data ?? [],
    isCategoriesLoading: categoriesQuery.isLoading,
    isLoadingFood: mode === "edit" && foodDetailQuery.isLoading,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    submitError,
    mode,
    onSubmit,
  };
}
