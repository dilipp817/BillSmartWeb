import apiClient from "@/lib/axios";
import { OrderStatus } from "@/constants";
import type { ApiResponse } from "@/types";
import type {
  DateRangeParams,
  DailySalesSummary,
  OrderRangeResponse,
  OrderTypeSummary,
  SalesReportData,
} from "../types";

/**
 * Report Service — API call + client-side aggregation.
 *
 * The backend has no dedicated reports endpoint — it exposes raw order data via
 * GET /orders/range. All aggregation (totals, daily breakdown, order-type split)
 * is computed here from that raw response.
 *
 * Layer: Service (API call + pure aggregation — no state, no toasts, no redirects)
 */

const ordersBase = (restaurantId: number) => `/v1/restaurants/${restaurantId}/orders`;

// ─── API Call ─────────────────────────────────────────────────────────────────

/**
 * GET /v1/restaurants/{restaurantId}/orders/range?start_date=&end_date=
 *
 * Returns raw orders within the given ISO 8601 date range.
 * Dates must be "YYYY-MM-DD" strings (e.g. "2026-04-01").
 */
export async function getOrdersInRange(
  restaurantId: number,
  params: DateRangeParams
): Promise<OrderRangeResponse> {
  const response = await apiClient.get<ApiResponse<OrderRangeResponse>>(
    `${ordersBase(restaurantId)}/range`,
    { params }
  );
  return response.data.data;
}

// ─── Aggregation ──────────────────────────────────────────────────────────────

/**
 * Compute SalesReportData from a raw OrderRangeResponse.
 *
 * CANCELLED orders are excluded from all revenue figures — a cancelled order
 * never results in a bill/payment so it must not inflate revenue totals.
 *
 * @param raw    The response from getOrdersInRange
 * @param params The same date range used in the request (echoed into the result)
 */
export function computeSalesReport(
  raw: OrderRangeResponse,
  params: DateRangeParams
): SalesReportData {
  // Exclude cancelled orders from all revenue calculations
  const billableOrders = raw.orders.filter((o) => o.status !== OrderStatus.CANCELLED);

  const total_revenue = billableOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const total_orders = billableOrders.length;
  const average_order_value = total_orders > 0 ? total_revenue / total_orders : 0;

  // ── Daily summary ──
  // Group by "YYYY-MM-DD" extracted from created_at ISO string
  const dailyMap = new Map<string, DailySalesSummary>();

  for (const order of billableOrders) {
    const date = order.created_at.slice(0, 10); // "2026-04-19T..." → "2026-04-19"
    const existing = dailyMap.get(date);
    if (existing) {
      existing.total += order.total_amount;
      existing.order_count += 1;
    } else {
      dailyMap.set(date, { date, total: order.total_amount, order_count: 1 });
    }
  }

  // Sort ascending so the chart renders left-to-right chronologically
  const daily_summary = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // ── By order type ──
  const typeMap = new Map<string, OrderTypeSummary>();

  for (const order of billableOrders) {
    const existing = typeMap.get(order.order_type);
    if (existing) {
      existing.count += 1;
      existing.total += order.total_amount;
    } else {
      typeMap.set(order.order_type, {
        order_type: order.order_type,
        count: 1,
        total: order.total_amount,
      });
    }
  }

  const by_order_type = Array.from(typeMap.values());

  return {
    start_date: params.start_date,
    end_date: params.end_date,
    total_revenue,
    total_orders,
    average_order_value,
    daily_summary,
    by_order_type,
  };
}
