import apiClient from "@/lib/axios";
import type { ApiResponse } from "@/types";

import type { RestaurantDto, UpdateRestaurantRequest } from "../types";

/**
 * Restaurant Service — all calls go through the Next.js /api proxy.
 *
 * Base path: /api/v1/restaurants
 *
 * Layer: Service (API calls only — no state, no toasts, no redirects)
 */

const base = "/v1/restaurants";

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/restaurants/{id}
 *
 * Fetch the restaurant record for the given ID.
 * Returns the full RestaurantDto (outlet_name, displayname, outlet_manager, address).
 *
 * Note: phone, email are NOT columns in the restaurant table and are not returned here.
 * Feature flags are fetched via the dedicated /feature-flags endpoint, not here.
 */
export async function getRestaurant(restaurantId: number): Promise<RestaurantDto> {
  const response = await apiClient.get<ApiResponse<RestaurantDto>>(`${base}/${restaurantId}`);
  return response.data.data;
}

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/restaurants/{id}
 *
 * Update restaurant details (admin only).
 * All fields in UpdateRestaurantRequest are required by the backend.
 *
 * Note: request body uses `store_address` for the address object,
 * while the GET response returns it as `address` — see RestaurantDto vs UpdateRestaurantRequest.
 *
 * Returns the updated RestaurantDto.
 */
export async function updateRestaurant(
  restaurantId: number,
  data: UpdateRestaurantRequest
): Promise<RestaurantDto> {
  const response = await apiClient.patch<ApiResponse<RestaurantDto>>(
    `${base}/${restaurantId}`,
    data
  );
  return response.data.data;
}
