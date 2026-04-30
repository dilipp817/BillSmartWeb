import apiClient from "@/lib/axios";
import type { ApiResponse } from "@/types";

import type { PendingOrderCountDto } from "../types";

/**
 * Fetch the count of orders currently in PENDING status for a restaurant.
 * GET /v1/restaurants/{restaurantId}/orders/count/pending
 */
export async function getPendingOrderCount(restaurantId: number): Promise<number> {
  const response = await apiClient.get<ApiResponse<PendingOrderCountDto>>(
    `/v1/restaurants/${restaurantId}/orders/count/pending`
  );
  return response.data.data.count;
}
