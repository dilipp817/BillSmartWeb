import apiClient from "@/lib/axios";
import type { ApiResponse } from "@/types";

import type { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from "../types";

/**
 * Category Service — read functions (O-05) + CRUD admin functions (M-03).
 *
 * Base path: /api/v1/categories
 *   GET    /api/v1/categories?restaurant_id={id}  — list categories for a restaurant
 *   GET    /api/v1/categories/{id}                — get single category
 *   POST   /api/v1/categories?restaurant_id={id}  — create category (admin only)
 *   PUT    /api/v1/categories/{id}                — update category (admin only, full replace)
 *   DELETE /api/v1/categories/{id}                — hard-delete category (admin only)
 *
 * Layer: Service (API calls only — no state, no toasts, no redirects)
 */

/**
 * GET /api/v1/categories?restaurant_id={restaurantId}
 *
 * List all categories for a restaurant.
 * Returns a plain array — there is no pagination wrapper for category lists.
 */
export async function listCategories(restaurantId: number): Promise<CategoryDto[]> {
  const response = await apiClient.get<ApiResponse<CategoryDto[]>>("/v1/categories", {
    params: { restaurant_id: restaurantId },
  });
  return response.data.data;
}

/**
 * GET /api/v1/categories/{id}
 *
 * Get a single category by ID.
 */
export async function getCategory(categoryId: number): Promise<CategoryDto> {
  const response = await apiClient.get<ApiResponse<CategoryDto>>(`/v1/categories/${categoryId}`);
  return response.data.data;
}

/**
 * POST /api/v1/categories?restaurant_id={restaurantId}
 *
 * Create a new category for the given restaurant (admin only).
 * restaurant_id is a query param (not a path param).
 * Returns the created CategoryDto.
 */
export async function createCategory(
  restaurantId: number,
  data: CreateCategoryRequest
): Promise<CategoryDto> {
  const response = await apiClient.post<ApiResponse<CategoryDto>>("/v1/categories", data, {
    params: { restaurant_id: restaurantId },
  });
  return response.data.data;
}

/**
 * PUT /api/v1/categories/{id}
 *
 * Full replace of a category (admin only).
 * Note: PUT — not PATCH. All fields are replaced.
 * Returns the updated CategoryDto.
 */
export async function updateCategory(
  categoryId: number,
  data: UpdateCategoryRequest
): Promise<CategoryDto> {
  const response = await apiClient.put<ApiResponse<CategoryDto>>(
    `/v1/categories/${categoryId}`,
    data
  );
  return response.data.data;
}

/**
 * DELETE /api/v1/categories/{id}
 *
 * Hard-delete a category (admin only).
 * Unlike food items, categories are permanently removed — not soft-deleted.
 */
export async function deleteCategory(categoryId: number): Promise<void> {
  await apiClient.delete(`/v1/categories/${categoryId}`);
}
