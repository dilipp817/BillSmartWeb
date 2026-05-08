// Shape returned by GET /restaurants/{rId}/orders/count/pending
export interface PendingOrderCountDto {
  pending_count: number;
}

// Shape used by useDashboardStats to drive the stat cards.
export interface DashboardStats {
  pendingOrderCount: number | null;
  todayOrderCount: number | null;
  todayRevenue: number | null;
}
