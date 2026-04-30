// ─── Category ─────────────────────────────────────────────────────────────────

// Returned by GET /api/v1/categories?restaurant_id={id}
export interface CategoryDto {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  /** Always 0 — mapper does not calculate from food table */
  food_count: number;
  restaurant_id: number;
}

// ─── Food (list / lightweight) ────────────────────────────────────────────────

// Lightweight shape returned by list endpoints:
// GET /api/v1/foods, GET /api/v1/foods/search, GET /api/v1/foods/restaurant/{id}
// Does NOT include category_id, description, restaurant_id, preparation_time, allergens, calories
export interface FoodListItem {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
  category_name: string;
  is_available: boolean;
  is_vegetarian: boolean;
  is_spicy: boolean;
}

// ─── Food (detail / full) ─────────────────────────────────────────────────────

// Full shape returned by GET /api/v1/foods/{id}
export interface FoodDetail {
  id: number;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  category_id: number;
  category_name: string;
  restaurant_id: number;
  restaurant_name: string;
  is_available: boolean;
  preparation_time: number | null;
  allergens: string | null;
  calories: number | null;
  is_vegetarian: boolean;
  is_spicy: boolean;
  created_at: string;
  updated_at: string | null;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

// The pagination envelope specific to food list endpoints
export interface FoodPagination {
  current_page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// The full inner data object for paginated food responses:
// ApiResponse<FoodPageData> — response.data.data gives FoodPageData
export interface FoodPageData {
  data: FoodListItem[];
  pagination: FoodPagination;
}

// ─── Query params ─────────────────────────────────────────────────────────────

// Parameters for GET /api/v1/foods
export interface FoodListParams {
  restaurant_id: number;
  search?: string;
  category_id?: number;
  is_vegetarian?: boolean;
  is_spicy?: boolean;
  offset?: number;
  limit?: number;
}

// ─── Create / Update (used in M-01 Admin forms) ───────────────────────────────

export interface CreateFoodRequest {
  name: string;
  price: number;
  description?: string;
  image_url?: string | null;
  category_id: number;
  is_vegetarian: boolean;
  is_spicy: boolean;
  // Note: is_available is NOT sent on create — always true by default
}

export type UpdateFoodRequest = CreateFoodRequest;

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  image_url?: string | null;
  display_order?: number;
}

export type UpdateCategoryRequest = CreateCategoryRequest;
