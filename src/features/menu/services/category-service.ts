import apiClient from "@/lib/axios";
import type { ApiResponse } from "@/types";

import type { CategoryDto } from "../types";

/**
 * Category Service — read functions used by the cashier browse flow (O-05).
 * CRUD functions (create, update, delete) are added in M-03 (Category Management Admin).
 *
 * Base path: /api/v1/categories
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
