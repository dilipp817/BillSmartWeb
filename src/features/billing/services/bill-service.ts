import apiClient from "@/lib/axios";
import type { ApiResponse } from "@/types";
import type { BillStatus } from "@/constants";
import type { BillDto, BillListItem, CreateBillRequest, GenerateBillParams } from "../types";

/**
 * Bill Service — all calls go through the Next.js /api proxy.
 *
 * Two base paths:
 *   Orders path: /api/v1/restaurants/{restaurantId}/orders/{orderId}  (generate-bill)
 *   Bills path:  /api/v1/bills                                         (all other bill ops)
 *
 * Layer: Service (API calls only — no state, no toasts, no redirects)
 */

const ordersBase = (restaurantId: number, orderId: number) =>
  `/v1/restaurants/${restaurantId}/orders/${orderId}`;

const billsBase = "/v1/bills";

// ─── Generate Bill (preferred) ────────────────────────────────────────────────

/**
 * POST /api/v1/restaurants/{restaurantId}/orders/{orderId}/generate-bill?discount=0
 *
 * Preferred way to create a bill — auto-computes subtotal from order items
 * and applies 18% GST (9% CGST + 9% SGST).
 *
 * Only MANAGER and ADMIN roles may supply a non-zero discount.
 * Returns the full BillDto.
 */
export async function generateBill(
  restaurantId: number,
  orderId: number,
  params: GenerateBillParams = {}
): Promise<BillDto> {
  const response = await apiClient.post<ApiResponse<BillDto>>(
    `${ordersBase(restaurantId, orderId)}/generate-bill`,
    null,
    { params: { discount: params.discount ?? 0 } }
  );
  return response.data.data;
}

// ─── Manual Bill Creation (fallback) ─────────────────────────────────────────

/**
 * POST /api/v1/bills
 *
 * Manual bill creation — only use when full control over amounts is needed.
 * In normal flow, use generateBill() above.
 * Returns the full BillDto.
 */
export async function createBill(data: CreateBillRequest): Promise<BillDto> {
  const response = await apiClient.post<ApiResponse<BillDto>>(billsBase, data);
  return response.data.data;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/bills/{id}
 *
 * Fetch full bill by ID — includes bill_items, paid_amount, remaining_amount.
 * Returns the full BillDto.
 */
export async function getBill(billId: number): Promise<BillDto> {
  const response = await apiClient.get<ApiResponse<BillDto>>(`${billsBase}/${billId}`);
  return response.data.data;
}

/**
 * GET /api/v1/bills/number/{billNumber}
 *
 * Fetch full bill by bill number string (e.g. "BILL-1-20260419-0001").
 * Returns the full BillDto.
 */
export async function getBillByNumber(billNumber: string): Promise<BillDto> {
  const response = await apiClient.get<ApiResponse<BillDto>>(`${billsBase}/number/${billNumber}`);
  return response.data.data;
}

/**
 * GET /api/v1/bills
 *
 * List bills paginated, scoped to the caller's restaurant.
 * Returns lightweight BillListItem[] — not the full BillDto.
 * Use getBill(id) to fetch full detail.
 */
export async function listBills(params?: {
  status?: BillStatus;
  page?: number;
  size?: number;
  sort?: string;
}): Promise<BillListItem[]> {
  const response = await apiClient.get<ApiResponse<BillListItem[]>>(billsBase, { params });
  return response.data.data;
}

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * PATCH /api/v1/bills/{id}/paid
 *
 * Mark a bill as PAID. Only valid when status is ISSUED or PARTIAL.
 * Returns the updated full BillDto.
 */
export async function markBillPaid(billId: number): Promise<BillDto> {
  const response = await apiClient.patch<ApiResponse<BillDto>>(`${billsBase}/${billId}/paid`);
  return response.data.data;
}

/**
 * PATCH /api/v1/bills/{id}/cancel
 *
 * Cancel a bill. Only valid when status is ISSUED or PARTIAL.
 * Returns the updated full BillDto.
 */
export async function cancelBill(billId: number): Promise<BillDto> {
  const response = await apiClient.patch<ApiResponse<BillDto>>(`${billsBase}/${billId}/cancel`);
  return response.data.data;
}
