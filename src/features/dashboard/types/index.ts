// Shape returned by GET /restaurants/{rId}/orders/count/pending
export interface PendingOrderCountDto {
  count: number;
}

// Shape used by useDashboardStats to drive the stat cards.
// Fields that depend on O-02 (order service) are marked as placeholders.
export interface DashboardStats {
  pendingOrderCount: number;
  // Wired after O-02 — today's total order count
  todayOrderCount: number | null;
  // Wired after O-02/B-02 — today's total revenue
  todayRevenue: number | null;
}
