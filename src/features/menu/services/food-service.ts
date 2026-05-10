import apiClient from "@/lib/axios";
import type { ApiResponse } from "@/types";

import type {
  CreateFoodRequest,
  FoodDetail,
  FoodListParams,
  FoodPageData,
  UpdateFoodRequest,
} from "../types";

/**
 * Food Service — read functions (O-05) + CRUD admin functions (M-02).
 *
 * Base paths:
 *   GET    /api/v1/foods                           — paginated list with all filters
 *   GET    /api/v1/foods/{id}                      — full detail
 *   POST   /api/v1/foods/restaurant/{restaurantId} — create food item (admin only)
 *   PUT    /api/v1/foods/{id}                      — update food item (admin only)
 *   DELETE /api/v1/foods/{id}                      — soft-delete food item (admin only)
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

/**
 * POST /api/v1/foods/restaurant/{restaurantId}
 *
 * Create a new food item for the given restaurant (admin only).
 * Note: is_available is NOT in the request body — backend always sets it to true on create.
 * Returns the full FoodDetail of the newly created item.
 */
export async function createFood(
  restaurantId: number,
  data: CreateFoodRequest
): Promise<FoodDetail> {
  const response = await apiClient.post<ApiResponse<FoodDetail>>(
    `/v1/foods/restaurant/${restaurantId}`,
    data
  );
  return response.data.data;
}

/**
 * PUT /api/v1/foods/{id}
 *
 * Update an existing food item (admin only).
 * is_available is NOT part of this request — managed via a separate toggle endpoint.
 * restaurant_id must be sent for schema consistency; backend ignores it for security
 * (ownership is verified via JWT).
 * Returns the full updated FoodDetail.
 */
export async function updateFood(foodId: number, data: UpdateFoodRequest): Promise<FoodDetail> {
  const response = await apiClient.put<ApiResponse<FoodDetail>>(`/v1/foods/${foodId}`, data);
  return response.data.data;
}

/**
 * DELETE /api/v1/foods/{id}
 *
 * Soft-delete a food item (admin only).
 * Sets is_deleted = true on the backend — the item never appears in any GET response again.
 * The record is kept in the DB to preserve order history.
 */
export async function deleteFood(foodId: number): Promise<void> {
  await apiClient.delete(`/v1/foods/${foodId}`);
}
