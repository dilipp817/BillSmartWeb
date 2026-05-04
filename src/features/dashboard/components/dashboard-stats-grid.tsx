"use client";

import { AlertCircle, ClipboardList, DollarSign, ShoppingBag } from "lucide-react";

import { formatCurrency } from "@/utils/currency";

import { StatCard } from "../components/stat-card";
import { useDashboardStats } from "../hooks/use-dashboard-stats";

export function DashboardStatsGrid() {
  const { stats, isLoading, isError } = useDashboardStats();

  if (isError) {
    return (
      <div className="text-destructive flex items-center gap-2 text-sm">
        <AlertCircle className="size-4 shrink-0" />
        <span>Could not load dashboard stats. They will refresh automatically.</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Pending Orders"
        value={stats?.pendingOrderCount != null ? stats.pendingOrderCount.toString() : "—"}
        icon={ClipboardList}
        isLoading={isLoading}
      />
      {/* Wired after O-02 is merged */}
      <StatCard
        label="Today's Orders"
        value={stats?.todayOrderCount != null ? stats.todayOrderCount.toString() : "—"}
        icon={ShoppingBag}
        isLoading={isLoading}
      />
      {/* Wired after O-02/B-02 is merged */}
      <StatCard
        label="Today's Revenue"
        value={stats?.todayRevenue != null ? formatCurrency(stats.todayRevenue) : "—"}
        icon={DollarSign}
        isLoading={isLoading}
      />
    </div>
  );
}
