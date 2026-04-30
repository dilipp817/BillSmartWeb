import apiClient from "@/lib/axios";
import type { ApiResponse } from "@/types";
import type { OrderItemStatus, OrderStatus } from "@/constants";
import type {
  AddOrderItemRequest,
  CreateOrderRequest,
  OrderDto,
  OrderListResponse,
  UpdateOrderItemRequest,
  UpdateOrderStatusRequest,
} from "../types";

/**
 * Order Service — all calls go through the Next.js /api proxy.
 *
 * Base path: /api/v1/restaurants/{restaurantId}/orders
 *
 * Layer: Service (API calls only — no state, no toasts, no redirects)
 */

const base = (restaurantId: number) => `/v1/restaurants/${restaurantId}/orders`;

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/restaurants/{restaurantId}/orders
 *
 * Create a new order (DINE_IN or TAKEAWAY).
 * For DINE_IN, table_id is required. For TAKEAWAY, set table_id to null.
 * Returns the full OrderDto.
 */
export async function createOrder(
  restaurantId: number,
  data: CreateOrderRequest
): Promise<OrderDto> {
  const response = await apiClient.post<ApiResponse<OrderDto>>(base(restaurantId), data);
  return response.data.data;
}

// ─── Read (list) ──────────────────────────────────────────────────────────────

/**
 * GET /api/v1/restaurants/{restaurantId}/orders
 *
 * List all orders. Returns the custom wrapper { orders, total, status }.
 */
export async function listOrders(restaurantId: number): Promise<OrderListResponse> {
  const response = await apiClient.get<ApiResponse<OrderListResponse>>(base(restaurantId));
  return response.data.data;
}

/**
 * GET /api/v1/restaurants/{restaurantId}/orders/active
 *
 * List active orders — all orders that are not COMPLETED or CANCELLED.
 * Returns the custom wrapper { orders, total, status }.
 */
export async function listActiveOrders(restaurantId: number): Promise<OrderListResponse> {
  const response = await apiClient.get<ApiResponse<OrderListResponse>>(
    `${base(restaurantId)}/active`
  );
  return response.data.data;
}

/**
 * GET /api/v1/restaurants/{restaurantId}/orders/status/{status}
 *
 * Filter orders by a specific OrderStatus.
 * Returns the custom wrapper { orders, total, status }.
 */
export async function listOrdersByStatus(
  restaurantId: number,
  status: OrderStatus
): Promise<OrderListResponse> {
  const response = await apiClient.get<ApiResponse<OrderListResponse>>(
    `${base(restaurantId)}/status/${status}`
  );
  return response.data.data;
}

/**
 * GET /api/v1/restaurants/{restaurantId}/orders/range?start_date=&end_date=
 *
 * List orders within a date range. Dates must be ISO 8601 strings.
 * Returns the custom wrapper { orders, total, status }.
 */
export async function listOrdersByDateRange(
  restaurantId: number,
  startDate: string,
  endDate: string
): Promise<OrderListResponse> {
  const response = await apiClient.get<ApiResponse<OrderListResponse>>(
    `${base(restaurantId)}/range`,
    { params: { start_date: startDate, end_date: endDate } }
  );
  return response.data.data;
}

/**
 * GET /api/v1/restaurants/{restaurantId}/orders/count/pending
 *
 * Count orders in PENDING status. Returns a plain number.
 */
export async function countPendingOrders(restaurantId: number): Promise<number> {
  const response = await apiClient.get<ApiResponse<number>>(`${base(restaurantId)}/count/pending`);
  return response.data.data;
}

/**
 * GET /api/v1/restaurants/{restaurantId}/orders/search?q=
 *
 * Search orders by order number, table, or status.
 * Returns the custom wrapper { orders, total, status }.
 */
export async function searchOrders(restaurantId: number, q: string): Promise<OrderListResponse> {
  const response = await apiClient.get<ApiResponse<OrderListResponse>>(
    `${base(restaurantId)}/search`,
    { params: { q } }
  );
  return response.data.data;
}

// ─── Read (single) ────────────────────────────────────────────────────────────

/**
 * GET /api/v1/restaurants/{restaurantId}/orders/{orderId}
 *
 * Get a single order by ID. Returns the full OrderDto.
 */
export async function getOrder(restaurantId: number, orderId: number): Promise<OrderDto> {
  const response = await apiClient.get<ApiResponse<OrderDto>>(`${base(restaurantId)}/${orderId}`);
  return response.data.data;
}

// ─── Status ───────────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/restaurants/{restaurantId}/orders/{orderId}/status
 *
 * Update order status. Only valid transitions are accepted by the server:
 *   PENDING → IN_PROGRESS | HOLD | CANCELLED
 *   IN_PROGRESS → COMPLETED | HOLD | CANCELLED
 *   COMPLETED → DELIVERED
 *   HOLD → IN_PROGRESS | CANCELLED
 * Invalid transitions return 400.
 * Returns the updated full OrderDto.
 */
export async function updateOrderStatus(
  restaurantId: number,
  orderId: number,
  data: UpdateOrderStatusRequest
): Promise<OrderDto> {
  const response = await apiClient.patch<ApiResponse<OrderDto>>(
    `${base(restaurantId)}/${orderId}/status`,
    data
  );
  return response.data.data;
}

// ─── Order Items ──────────────────────────────────────────────────────────────

/**
 * POST /api/v1/restaurants/{restaurantId}/orders/{orderId}/items
 *
 * Add an item to an existing order.
 * Only allowed when order status is PENDING or HOLD.
 * Returns the updated full OrderDto.
 */
export async function addOrderItem(
  restaurantId: number,
  orderId: number,
  data: AddOrderItemRequest
): Promise<OrderDto> {
  const response = await apiClient.post<ApiResponse<OrderDto>>(
    `${base(restaurantId)}/${orderId}/items`,
    data
  );
  return response.data.data;
}

/**
 * PUT /api/v1/restaurants/{restaurantId}/orders/{orderId}/items/{itemId}
 *
 * Update an order item's quantity and/or special requests.
 * Only allowed when the item status is PENDING or IN_PROGRESS.
 * Returns the updated full OrderDto.
 */
export async function updateOrderItem(
  restaurantId: number,
  orderId: number,
  itemId: number,
  data: UpdateOrderItemRequest
): Promise<OrderDto> {
  const response = await apiClient.put<ApiResponse<OrderDto>>(
    `${base(restaurantId)}/${orderId}/items/${itemId}`,
    data
  );
  return response.data.data;
}

/**
 * PATCH /api/v1/restaurants/{restaurantId}/orders/{orderId}/items/{itemId}/status?new_status=
 *
 * Update an order item's status. The new_status is a query parameter.
 * Accepted values: PENDING, IN_PROGRESS, READY, SERVED, CANCELLED.
 * Returns the updated full OrderDto.
 */
export async function updateOrderItemStatus(
  restaurantId: number,
  orderId: number,
  itemId: number,
  newStatus: OrderItemStatus
): Promise<OrderDto> {
  const response = await apiClient.patch<ApiResponse<OrderDto>>(
    `${base(restaurantId)}/${orderId}/items/${itemId}/status`,
    null,
    { params: { new_status: newStatus } }
  );
  return response.data.data;
}

/**
 * DELETE /api/v1/restaurants/{restaurantId}/orders/{orderId}/items/{itemId}
 *
 * Remove an item from an order.
 * Only allowed when order status is PENDING or HOLD.
 * Returns the updated full OrderDto.
 */
export async function removeOrderItem(
  restaurantId: number,
  orderId: number,
  itemId: number
): Promise<OrderDto> {
  const response = await apiClient.delete<ApiResponse<OrderDto>>(
    `${base(restaurantId)}/${orderId}/items/${itemId}`
  );
  return response.data.data;
}

// ─── Cancel ───────────────────────────────────────────────────────────────────

/**
 * DELETE /api/v1/restaurants/{restaurantId}/orders/{orderId}
 *
 * Cancel an order. Admin/Manager only.
 * Allowed when status is PENDING, IN_PROGRESS, or HOLD.
 * COMPLETED, DELIVERED, and CANCELLED orders cannot be cancelled.
 */
export async function cancelOrder(restaurantId: number, orderId: number): Promise<void> {
  await apiClient.delete(`${base(restaurantId)}/${orderId}`);
}
