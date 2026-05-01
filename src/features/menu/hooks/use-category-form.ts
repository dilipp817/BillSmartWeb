"use client";

import { useEffect } from "react";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { type Resolver, useForm } from "react-hook-form";

import { useAuthStore } from "@/store/use-auth-store";

import { createCategory, getCategory, updateCategory } from "../services/category-service";
import type { CreateCategoryRequest } from "../types";
import { CATEGORIES_QUERY_KEY } from "./use-food-browse";
import { CATEGORY_MANAGEMENT_QUERY_KEY } from "./use-category-management";
import { categoryFormSchema, type CategoryFormValues } from "../utils/category-form-schema";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CategoryFormMode = "add" | "edit";

export interface UseCategoryFormResult {
  form: ReturnType<typeof useForm<CategoryFormValues>>;
  isLoadingCategory: boolean;
  isSubmitting: boolean;
  submitError: string | null;
  mode: CategoryFormMode;
  onSubmit: (values: CategoryFormValues) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseCategoryFormOptions {
  mode: CategoryFormMode;
  /** Required when mode === "edit" */
  categoryId?: number;
}

/**
 * useCategoryForm — ViewModel for the Add/Edit Category form (M-06).
 *
 * - "add" mode: submits POST /api/v1/categories?restaurant_id={id}, then
 *   navigates back to /categories.
 * - "edit" mode: fetches category via GET /api/v1/categories/{id}, pre-fills
 *   the form, then submits PUT /api/v1/categories/{id} on save.
 *
 * Layer: Hook (state + logic — no JSX, no direct API calls)
 */
export function useCategoryForm({
  mode,
  categoryId,
}: UseCategoryFormOptions): UseCategoryFormResult {
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<CategoryFormValues>({
    // Cast needed: z.coerce.number() has input type `unknown` which causes a
    // contravariance mismatch with standardSchemaResolver's generic inference.
    // The cast is safe — the resolver correctly validates and coerces the fields.
    resolver: standardSchemaResolver(categoryFormSchema) as Resolver<CategoryFormValues>,
    defaultValues: {
      name: "",
      description: "",
      image_url: "",
      display_order: 0,
    },
  });

  // ── Edit mode: fetch category and populate form ───────────────────────────
  const categoryDetailQuery = useQuery({
    queryKey: ["menu", "categories", "detail", categoryId],
    queryFn: () => getCategory(categoryId!),
    enabled: mode === "edit" && categoryId !== undefined,
  });

  useEffect(() => {
    if (mode === "edit" && categoryDetailQuery.data) {
      const c = categoryDetailQuery.data;
      form.reset({
        name: c.name,
        description: c.description ?? "",
        image_url: c.image_url ?? "",
        display_order: c.display_order,
      });
    }
  }, [mode, categoryDetailQuery.data, form]);

  // ── Add mutation ─────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => {
      if (!restaurantId) throw new Error("No restaurant context");
      return createCategory(restaurantId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_MANAGEMENT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      router.push("/categories");
    },
  });

  // ── Edit mutation ─────────────────────────────────────────────────────────
  const updateMutation = useMutation({
    mutationFn: (data: CreateCategoryRequest) => {
      if (!categoryId) throw new Error("No category ID");
      return updateCategory(categoryId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_MANAGEMENT_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY });
      router.push("/categories");
    },
  });

  // ── Submit handler ────────────────────────────────────────────────────────
  function onSubmit(values: CategoryFormValues) {
    const request: CreateCategoryRequest = {
      name: values.name,
      ...(values.description?.trim() && { description: values.description.trim() }),
      image_url: values.image_url || null,
      display_order: values.display_order,
    };

    if (mode === "add") {
      createMutation.mutate(request);
    } else {
      updateMutation.mutate(request);
    }
  }

  const activeError = mode === "add" ? createMutation.error : updateMutation.error;
  const submitError = activeError
    ? (activeError as Error).message || "Failed to save category."
    : null;

  return {
    form,
    isLoadingCategory: mode === "edit" && categoryDetailQuery.isLoading,
    isSubmitting: createMutation.isPending || updateMutation.isPending,
    submitError,
    mode,
    onSubmit,
  };
}
