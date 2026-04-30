import apiClient from "@/lib/axios";
import type { ApiResponse } from "@/types";
import type {
  CreatePaymentRequest,
  PaymentDto,
  PaymentListResponse,
  UpdatePaymentStatusRequest,
} from "../types";

/**
 * Payment Service — all calls go through the Next.js /api proxy.
 *
 * Base path: /api/v1/payments
 *
 * Layer: Service (API calls only — no state, no toasts, no redirects)
 *
 * ⚠️ CRITICAL — never optimistic-update payment or bill UI.
 *    Always wait for server confirmation before showing success.
 *
 * ⚠️ reference_number MUST be generated BEFORE calling createPayment().
 *    Use generatePaymentRef() from src/utils/payment-ref.ts.
 *    The same value is forwarded as X-Idempotency-Key to prevent duplicate charges.
 */

const paymentsBase = "/v1/payments";

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/payments
 *
 * Create (and optionally process) a payment.
 *
 * auto_process behaviour:
 *   true  → payment is immediately set to SUCCESS (use for CASH, UPI, WALLET)
 *   false → payment stays PENDING until PATCH /{id}/process (use for CARD terminal flow)
 *
 * The X-Idempotency-Key header is set to data.reference_number so retrying
 * the same request never creates a duplicate charge.
 *
 * ⚠️ Call generatePaymentRef() BEFORE this function and persist the value
 *    so it survives a retry even if the component re-renders.
 */
export async function createPayment(data: CreatePaymentRequest): Promise<PaymentDto> {
  const response = await apiClient.post<ApiResponse<PaymentDto>>(paymentsBase, data, {
    headers: {
      "X-Idempotency-Key": data.reference_number,
    },
  });
  return response.data.data;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/payments/{id}
 *
 * Fetch the full PaymentDto by ID.
 * Includes all fields: bill_id, transaction_id, notes, change_amount, restaurant_id.
 */
export async function getPayment(paymentId: number): Promise<PaymentDto> {
  const response = await apiClient.get<ApiResponse<PaymentDto>>(`${paymentsBase}/${paymentId}`);
  return response.data.data;
}

/**
 * GET /api/v1/payments/bill/{billId}
 *
 * Paginated list of payments linked to a specific bill.
 * Returns lightweight PaymentListItem[] (no bill_id, transaction_id, notes, etc.)
 * Use getPayment(id) for the full PaymentDto.
 */
export async function getPaymentsByBill(
  billId: number,
  params?: { offset?: number; limit?: number }
): Promise<PaymentListResponse> {
  const response = await apiClient.get<ApiResponse<PaymentListResponse>>(
    `${paymentsBase}/bill/${billId}`,
    { params }
  );
  return response.data.data;
}

/**
 * GET /api/v1/payments/order/{orderId}
 *
 * Paginated list of payments linked to a specific order.
 * Returns lightweight PaymentListItem[] (no bill_id, transaction_id, notes, etc.)
 * Use getPayment(id) for the full PaymentDto.
 */
export async function getPaymentsByOrder(
  orderId: number,
  params?: { offset?: number; limit?: number }
): Promise<PaymentListResponse> {
  const response = await apiClient.get<ApiResponse<PaymentListResponse>>(
    `${paymentsBase}/order/${orderId}`,
    { params }
  );
  return response.data.data;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/payments/{id}/process
 *
 * Mark a PENDING payment as SUCCESS (CARD terminal shortcut).
 * Only valid when payment status is PENDING.
 * Returns the updated full PaymentDto.
 */
export async function processPayment(paymentId: number): Promise<PaymentDto> {
  const response = await apiClient.patch<ApiResponse<PaymentDto>>(
    `${paymentsBase}/${paymentId}/process`
  );
  return response.data.data;
}

/**
 * PATCH /api/v1/payments/{id}/refund
 *
 * Refund a SUCCESS payment (transitions status to REFUNDED).
 * Only valid when payment status is SUCCESS.
 * Returns the updated full PaymentDto.
 */
export async function refundPayment(paymentId: number): Promise<PaymentDto> {
  const response = await apiClient.patch<ApiResponse<PaymentDto>>(
    `${paymentsBase}/${paymentId}/refund`
  );
  return response.data.data;
}

/**
 * PATCH /api/v1/payments/{id}/status
 *
 * Explicit status transition — use when the shortcut endpoints (process/refund) don't fit.
 * Valid transitions:
 *   PENDING  → SUCCESS  (prefer processPayment() instead)
 *   PENDING  → FAILED
 *   SUCCESS  → REFUNDED (prefer refundPayment() instead)
 *   FAILED   → PENDING  (retry)
 * Returns the updated full PaymentDto.
 */
export async function updatePaymentStatus(
  paymentId: number,
  data: UpdatePaymentStatusRequest
): Promise<PaymentDto> {
  const response = await apiClient.patch<ApiResponse<PaymentDto>>(
    `${paymentsBase}/${paymentId}/status`,
    data
  );
  return response.data.data;
}
