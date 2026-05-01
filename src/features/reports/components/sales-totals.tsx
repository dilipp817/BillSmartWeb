"use client";

import { formatCurrency } from "@/utils/currency";

import type { SalesReportData } from "../types";

interface SalesTotalsProps {
  report: SalesReportData;
}

interface StatCardProps {
  label: string;
  value: string;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-card ring-foreground/10 flex flex-col gap-1 rounded-xl px-5 py-4 ring-1">
      <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
    </div>
  );
}

/**
 * SalesTotals — three headline stat cards: revenue, orders, average order value.
 */
export function SalesTotals({ report }: SalesTotalsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard label="Total Revenue" value={formatCurrency(report.total_revenue)} />
      <StatCard label="Total Orders" value={String(report.total_orders)} />
      <StatCard label="Avg. Order Value" value={formatCurrency(report.average_order_value)} />
    </div>
  );
}
