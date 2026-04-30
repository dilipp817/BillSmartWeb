import type { BillStatus, PaymentMethod, PaymentStatus } from "@/constants";

// ─── Bill Item ────────────────────────────────────────────────────────────────

/**
 * A single line item inside a full BillDto.
 * Returned by GET /api/v1/bills/{id} and all mutating bill endpoints.
 * Note: field name is `item_total` (not `subtotal`) — never confuse the two.
 */
export interface BillItemDto {
  id: number;
  bill_id: number;
  food_id: number;
  food_name: string;
  quantity: number;
  unit_price: number;
  /** ⚠️ Field is `item_total` — NOT `subtotal` */
  item_total: number;
  created_at: string;
}

// ─── Bill ─────────────────────────────────────────────────────────────────────

/**
 * Full bill response — returned by:
 *   POST /api/v1/restaurants/{restaurantId}/orders/{orderId}/generate-bill
 *   POST /api/v1/bills
 *   GET /api/v1/bills/{id}
 *   GET /api/v1/bills/number/{billNumber}
 *   PATCH /api/v1/bills/{id}/paid
 *   PATCH /api/v1/bills/{id}/cancel
 *   POST /api/v1/bills/{id}/items
 *   DELETE /api/v1/bills/{id}/items/{itemId}
 *
 * ⚠️ paid_amount and remaining_amount are computed server-side from SUCCESS payments.
 * Never compute these client-side.
 */
export interface BillDto {
  id: number;
  bill_number: string;
  order_id: number;
  restaurant_id: number;
  restaurant_name: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  /** 9% of subtotal — never compute client-side */
  cgst_amount: number;
  /** 9% of subtotal — never compute client-side */
  sgst_amount: number;
  total_amount: number;
  /** Sum of all SUCCESS payments — read from server, never compute client-side */
  paid_amount: number;
  /** total_amount − paid_amount (floored at 0) — read from server, never compute client-side */
  remaining_amount: number;
  status: BillStatus;
  bill_items: BillItemDto[];
  created_at: string;
  updated_at: string;
}

/**
 * Lightweight bill shape returned by GET /api/v1/bills (list endpoint).
 * Does NOT include: restaurant_id, subtotal, tax fields, bill_items, paid_amount, remaining_amount.
 * Use GET /api/v1/bills/{id} for the full BillDto.
 */
export interface BillListItem {
  id: number;
  bill_number: string;
  order_id: number;
  restaurant_name: string;
  total_amount: number;
  status: BillStatus;
  created_at: string;
}

// ─── Bill Requests ────────────────────────────────────────────────────────────

/**
 * Query params for POST /api/v1/restaurants/{restaurantId}/orders/{orderId}/generate-bill
 *
 * Preferred way to generate a bill — auto-computes subtotal from order items
 * and applies 18% GST (9% CGST + 9% SGST).
 * Only MANAGER and ADMIN roles may apply a non-zero discount.
 *
 * Tax formula: tax = subtotal * 0.18, total = subtotal + tax − discount
 * (tax is on full subtotal; discount is subtracted after tax)
 */
export interface GenerateBillParams {
  /** Discount in rupees (not percent). Default 0. Manager/admin only for non-zero. */
  discount?: number;
}

/**
 * Request body for POST /api/v1/bills (manual bill creation).
 * ⚠️ Only use when full control over amounts is required.
 * In normal flow, always use generate-bill via the orders endpoint.
 */
export interface CreateBillRequest {
  order_id: number;
  restaurant_id: number;
  subtotal: number;
  total_amount: number;
  /** Auto-generated if null/omitted: BILL-{restaurantId}-{yyyyMMdd}-{seq} */
  bill_number?: string | null;
  tax_amount?: number;
  cgst_amount?: number;
  sgst_amount?: number;
  discount_amount?: number;
  status?: BillStatus;
}

// ─── Payment ──────────────────────────────────────────────────────────────────

/**
 * Full payment response — returned by:
 *   POST /api/v1/payments
 *   GET /api/v1/payments/{id}
 *   PATCH /api/v1/payments/{id}/status
 *   PATCH /api/v1/payments/{id}/process
 *   PATCH /api/v1/payments/{id}/refund
 */
export interface PaymentDto {
  id: number;
  bill_id: number | null;
  order_id: number;
  restaurant_id: number;
  amount: number;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  transaction_id: string | null;
  reference_number: string;
  notes: string | null;
  change_amount: number;
  created_at: string;
  updated_at: string;
}

/**
 * Lightweight payment shape returned in list responses by:
 *   GET /api/v1/payments/bill/{billId}
 *   GET /api/v1/payments/order/{orderId}
 *
 * Does NOT include: bill_id, transaction_id, notes, change_amount, restaurant_id.
 * Use GET /api/v1/payments/{id} for the full PaymentDto.
 */
export interface PaymentListItem {
  id: number;
  order_id: number;
  payment_method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  reference_number: string;
  created_at: string;
}

/** Paginated wrapper returned by GET /api/v1/payments/bill/{billId} and /order/{orderId} */
export interface PaymentListResponse {
  payments: PaymentListItem[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

// ─── Payment Requests ─────────────────────────────────────────────────────────

/**
 * Request body for POST /api/v1/payments
 *
 * ⚠️ reference_number is REQUIRED and must be unique — generate BEFORE the network call
 * using generatePaymentRef() from src/utils/payment-ref.ts.
 *
 * Send the same value as X-Idempotency-Key header to prevent duplicate payments on retries.
 *
 * auto_process:
 *   true  = immediately mark as SUCCESS (use for CASH / UPI / WALLET)
 *   false = stays PENDING until PATCH /{id}/process (use for CARD terminal flow)
 */
export interface CreatePaymentRequest {
  order_id: number;
  /** Optional — links payment to a specific bill */
  bill_id?: number;
  amount: number;
  payment_method: PaymentMethod;
  /** Must be unique. Generate BEFORE making the network call. */
  reference_number: string;
  /** Change returned to customer for cash overpayments. Default 0. */
  change_amount?: number;
  /** true = immediately SUCCESS (CASH/UPI/WALLET). false = PENDING until PATCH /process (CARD). Default false. */
  auto_process?: boolean;
  transaction_id?: string;
  notes?: string;
}

/** Request body for PATCH /api/v1/payments/{id}/status */
export interface UpdatePaymentStatusRequest {
  status: PaymentStatus;
}
