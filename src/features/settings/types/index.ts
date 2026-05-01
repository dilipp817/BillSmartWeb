import type { Address } from "@/types/address";

/**
 * Restaurant data as returned by GET /api/v1/restaurants/{id}.
 * Note: the nested address field is named `address` in the response,
 * but `store_address` in the request body — see UpdateRestaurantRequest.
 */
export interface RestaurantDto {
  id: number;
  outlet_name: string;
  displayname: string;
  outlet_manager: string;
  address: Address;
  created_at: string;
  updated_at: string;
}

/**
 * Request body for POST /api/v1/restaurants and PATCH /api/v1/restaurants/{id}.
 * All fields required by the backend.
 */
export interface UpdateRestaurantRequest {
  outlet_name: string;
  displayname: string;
  outlet_manager: string;
  store_address: Address;
}
