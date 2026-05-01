import { OrderType } from "@/constants";
import type { OrderDto } from "@/features/orders/types";

// ─── Query Params ─────────────────────────────────────────────────────────────

// Query params for GET /orders/range?start_date=&end_date=
// Dates are ISO 8601: "YYYY-MM-DD"
export interface DateRangeParams {
  start_date: string;
  end_date: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

// Response from GET /orders/range — same list wrapper as other order list endpoints
export interface OrderRangeResponse {
  orders: OrderDto[];
  total: number;
  status: string;
}

// ─── Computed Aggregates ──────────────────────────────────────────────────────
// These are NOT returned by the backend — they are computed in the report service
// from the raw OrderRangeResponse (R-02).

// Per-day revenue and order count — used to plot the revenue chart (R-03)
export interface DailySalesSummary {
  date: string; // "YYYY-MM-DD"
  total: number;
  order_count: number;
}

// Revenue and count breakdown per order type
export interface OrderTypeSummary {
  order_type: OrderType;
  count: number;
  total: number;
}

// Full computed report — produced by the report service, consumed by R-03 screen
export interface SalesReportData {
  // Raw date range
  start_date: string;
  end_date: string;

  // Headline totals
  total_revenue: number;
  total_orders: number;
  average_order_value: number;

  // Breakdowns
  daily_summary: DailySalesSummary[];
  by_order_type: OrderTypeSummary[];
}
