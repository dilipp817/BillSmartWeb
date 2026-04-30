import { DashboardStatsGrid } from "@/features/dashboard/components/dashboard-stats-grid";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Today&apos;s overview for your restaurant.
        </p>
      </div>
      <DashboardStatsGrid />
    </div>
  );
}
