import type { FeatureFlags } from "@/store/use-feature-flag-store";
import type { ApiResponse } from "@/types";
import apiClient from "@/lib/axios";

/**
 * GET /api/v1/restaurants/{restaurantId}/feature-flags
 *
 * Returns the feature flags configured for the restaurant.
 * The proxy attaches the Authorization header from the httpOnly cookie.
 *
 * Layer: Service (API calls only — no state, no redirects, no toasts)
 */
export async function getFeatureFlags(restaurantId: number): Promise<FeatureFlags> {
  const response = await apiClient.get<ApiResponse<{ flags: FeatureFlags }>>(
    `/v1/restaurants/${restaurantId}/feature-flags`
  );
  return response.data.data.flags;
}
