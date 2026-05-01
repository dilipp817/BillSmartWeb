"use client";

import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { formatCurrency } from "@/utils/currency";

import { DateRangePicker } from "./date-range-picker";
import { RevenueChart } from "./revenue-chart";
import { SalesTotals } from "./sales-totals";
import { useSalesReport } from "../hooks/use-sales-report";

/**
 * SalesReportView — full client component for the Sales Report screen.
 *
 * Feature-flagged: hidden entirely when is_sales_reports_enabled is false.
 * Orchestrates the DateRangePicker, SalesTotals, RevenueChart, and
 * order-type breakdown table.
 */
export function SalesReportView() {
  const isEnabled = useFeatureFlag("is_sales_reports_enabled");
  const { report, isLoading, isError, startDate, endDate, setDateRange } = useSalesReport();

  if (!isEnabled) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* Date range picker */}
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        isLoading={isLoading}
        onApply={setDateRange}
      />

      {/* Error state */}
      {isError && (
        <div className="bg-destructive/10 text-destructive rounded-lg px-4 py-3 text-sm">
          Failed to load report data. Please try again.
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-card ring-foreground/10 h-20 animate-pulse rounded-xl ring-1"
              />
            ))}
          </div>
          <div className="bg-card ring-foreground/10 h-72 animate-pulse rounded-xl ring-1" />
        </div>
      )}

      {/* Report data */}
      {!isLoading && report && (
        <>
          {/* Headline totals */}
          <SalesTotals report={report} />

          {/* Daily revenue chart */}
          <div className="bg-card ring-foreground/10 rounded-xl px-4 py-5 ring-1">
            <h2 className="mb-4 text-sm font-medium">Daily Revenue</h2>
            <RevenueChart data={report.daily_summary} />
          </div>

          {/* Order type breakdown */}
          {report.by_order_type.length > 0 && (
            <div className="bg-card ring-foreground/10 rounded-xl px-4 py-5 ring-1">
              <h2 className="mb-4 text-sm font-medium">By Order Type</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b text-left">
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 text-right font-medium">Orders</th>
                    <th className="pb-2 text-right font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {report.by_order_type.map((row) => (
                    <tr key={row.order_type} className="border-b last:border-0">
                      <td className="py-2">{row.order_type.replace("_", " ")}</td>
                      <td className="py-2 text-right tabular-nums">{row.count}</td>
                      <td className="py-2 text-right tabular-nums">{formatCurrency(row.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Empty state — query succeeded but no orders */}
      {!isLoading && !isError && report && report.total_orders === 0 && (
        <p className="text-muted-foreground text-sm">
          No orders found between {report.start_date} and {report.end_date}.
        </p>
      )}
    </div>
  );
}
