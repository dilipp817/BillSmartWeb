import apiClient from "@/lib/axios";
import type { ApiResponse } from "@/types";

import type { FoodDetail, FoodListParams, FoodPageData } from "../types";

/**
 * Food Service — read functions used by the cashier browse flow (O-05).
 * CRUD functions (create, delete) are added in M-02 (Menu Management Admin).
 *
 * Base paths:
 *   GET /api/v1/foods               — paginated list with all filters
 *   GET /api/v1/foods/{id}          — full detail
 *
 * Layer: Service (API calls only — no state, no toasts, no redirects)
 */

/**
 * GET /api/v1/foods
 *
 * Paginated food list with optional filters:
 * search, category_id, is_vegetarian, is_spicy, offset, limit.
 *
 * ⚠️ restaurant_id is a query param here (not a path param).
 *    If omitted or 0, the backend returns an empty list.
 *    Always pass restaurantId explicitly.
 *
 * Returns FoodPageData: { data: FoodListItem[], pagination: FoodPagination }
 */
export async function listFoods(params: FoodListParams): Promise<FoodPageData> {
  const response = await apiClient.get<ApiResponse<FoodPageData>>("/v1/foods", { params });
  return response.data.data;
}

/**
 * GET /api/v1/foods/{id}
 *
 * Get the full detail of a single food item.
 * Returns FoodDetail (includes category_id, description, restaurant_id, etc.)
 */
export async function getFood(foodId: number): Promise<FoodDetail> {
  const response = await apiClient.get<ApiResponse<FoodDetail>>(`/v1/foods/${foodId}`);
  return response.data.data;
}
