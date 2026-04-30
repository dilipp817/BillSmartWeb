import { OrderItemStatus, OrderStatus, OrderType } from "@/constants";

// ─── Order Item ───────────────────────────────────────────────────────────────

// Single item inside an OrderDto (returned by the server)
export interface OrderItemDto {
  id: number;
  food_id: number;
  food_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  item_status: OrderItemStatus;
  special_requests: string | null;
  created_at: string;
}

// ─── Order ────────────────────────────────────────────────────────────────────

// Full order response — returned by single-item endpoints:
// POST /, GET /{orderId}, PATCH /{orderId}/status, POST /{orderId}/items, etc.
export interface OrderDto {
  id: number;
  restaurant_id: number;
  // null for TAKEAWAY orders — always present in JSON, serialised as null
  table_id: number | null;
  table_number: string | null;
  order_number: string;
  status: OrderStatus;
  order_type: OrderType;
  items: OrderItemDto[];
  subtotal: number;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  version: number;
}

// Wrapper returned by list endpoints:
// GET /, GET /active, GET /status/{status}, GET /range, GET /search
export interface OrderListResponse {
  orders: OrderDto[];
  total: number;
  status: string;
}

// ─── Request Bodies ───────────────────────────────────────────────────────────

// Single item inside CreateOrderRequest
export interface CreateOrderItemRequest {
  food_id: number;
  quantity: number;
  special_requests?: string;
}

// POST / — create a new order
export interface CreateOrderRequest {
  table_id: number | null;
  order_type: OrderType;
  items: CreateOrderItemRequest[];
  notes?: string;
}

// POST /{orderId}/items — add an item to an existing order
export type AddOrderItemRequest = CreateOrderItemRequest;

// PUT /{orderId}/items/{itemId} — update item quantity / special requests
export interface UpdateOrderItemRequest {
  quantity: number;
  special_requests?: string | null;
}

// PATCH /{orderId}/status — update order status
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
