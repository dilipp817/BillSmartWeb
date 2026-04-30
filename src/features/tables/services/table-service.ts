import apiClient from "@/lib/axios";
import type { ApiResponse } from "@/types";
import type {
  AvailableTableDto,
  CreateTableRequest,
  TableDto,
  TableListResponse,
  UpdateTableRequest,
} from "../types";

/**
 * Table Service — all calls go through the Next.js /api proxy.
 *
 * Base path: /api/v1/restaurants/{restaurantId}/tables
 *
 * Layer: Service (API calls only — no state, no toasts, no redirects)
 */

const base = (restaurantId: number) => `/v1/restaurants/${restaurantId}/tables`;

/**
 * POST /api/v1/restaurants/{restaurantId}/tables
 *
 * Create a new table. Returns the full TableDto.
 */
export async function createTable(
  restaurantId: number,
  data: CreateTableRequest
): Promise<TableDto> {
  const response = await apiClient.post<ApiResponse<TableDto>>(base(restaurantId), data);
  return response.data.data;
}

/**
 * GET /api/v1/restaurants/{restaurantId}/tables
 *
 * List all tables. Returns the custom wrapper { tables, total, status }.
 */
export async function listTables(restaurantId: number): Promise<TableListResponse> {
  const response = await apiClient.get<ApiResponse<TableListResponse>>(base(restaurantId));
  return response.data.data;
}

/**
 * GET /api/v1/restaurants/{restaurantId}/tables/{id}
 *
 * Get a single table by ID. Returns the full TableDto.
 */
export async function getTable(restaurantId: number, tableId: number): Promise<TableDto> {
  const response = await apiClient.get<ApiResponse<TableDto>>(`${base(restaurantId)}/${tableId}`);
  return response.data.data;
}

/**
 * GET /api/v1/restaurants/{restaurantId}/tables/available
 *
 * List available tables. Returns a plain array of AvailableTableDto.
 * Optionally pass minCapacity to filter by minimum seat count.
 */
export async function listAvailableTables(
  restaurantId: number,
  minCapacity?: number
): Promise<AvailableTableDto[]> {
  const params = minCapacity !== undefined ? { capacity: minCapacity } : {};
  const response = await apiClient.get<AvailableTableDto[]>(`${base(restaurantId)}/available`, {
    params,
  });
  return response.data;
}

/**
 * GET /api/v1/restaurants/{restaurantId}/tables/occupied
 *
 * List occupied tables. Returns an array of full TableDto.
 */
export async function listOccupiedTables(restaurantId: number): Promise<TableDto[]> {
  const response = await apiClient.get<ApiResponse<TableDto[]>>(`${base(restaurantId)}/occupied`);
  return response.data.data;
}

/**
 * GET /api/v1/restaurants/{restaurantId}/tables/status/{status}
 *
 * Filter tables by a specific status. Returns an array of full TableDto.
 */
export async function listTablesByStatus(
  restaurantId: number,
  status: string
): Promise<TableDto[]> {
  const response = await apiClient.get<ApiResponse<TableDto[]>>(
    `${base(restaurantId)}/status/${status}`
  );
  return response.data.data;
}

/**
 * GET /api/v1/restaurants/{restaurantId}/tables/count/available
 *
 * Returns the count of available tables.
 */
export async function countAvailableTables(restaurantId: number): Promise<number> {
  const response = await apiClient.get<ApiResponse<number>>(
    `${base(restaurantId)}/count/available`
  );
  return response.data.data;
}

/**
 * PUT /api/v1/restaurants/{restaurantId}/tables/{id}
 *
 * Update table details (number, capacity, floor, status).
 * Returns the updated full TableDto.
 */
export async function updateTable(
  restaurantId: number,
  tableId: number,
  data: UpdateTableRequest
): Promise<TableDto> {
  const response = await apiClient.put<ApiResponse<TableDto>>(
    `${base(restaurantId)}/${tableId}`,
    data
  );
  return response.data.data;
}

/**
 * PATCH /api/v1/restaurants/{restaurantId}/tables/{id}/status?new_status={status}
 *
 * Update only the status of a table. The new_status is a query parameter.
 * Returns the updated full TableDto.
 */
export async function updateTableStatus(
  restaurantId: number,
  tableId: number,
  newStatus: string
): Promise<TableDto> {
  const response = await apiClient.patch<ApiResponse<TableDto>>(
    `${base(restaurantId)}/${tableId}/status`,
    null,
    { params: { new_status: newStatus } }
  );
  return response.data.data;
}

/**
 * DELETE /api/v1/restaurants/{restaurantId}/tables/{id}
 *
 * Delete a table by ID.
 */
export async function deleteTable(restaurantId: number, tableId: number): Promise<void> {
  await apiClient.delete(`${base(restaurantId)}/${tableId}`);
}
