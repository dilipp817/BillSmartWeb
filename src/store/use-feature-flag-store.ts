"use client";

import { create } from "zustand";

// All feature flags with their defaults.
// Defaults are used if the API call fails — never crash on missing flags.
export interface FeatureFlags {
  is_table_management_enabled: boolean;
  is_bill_printing_enabled: boolean;
  is_bill_discount_enabled: boolean;
  is_split_payment_enabled: boolean;
  is_sales_reports_enabled: boolean;
  is_realtime_updates_enabled: boolean;
  is_kitchen_display_enabled: boolean;
  is_offline_order_sync_enabled: boolean;
  is_online_order_enabled: boolean;
  is_pay_before_seat_enabled: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  is_table_management_enabled: true,
  is_bill_printing_enabled: true,
  is_bill_discount_enabled: true,
  is_split_payment_enabled: false,
  is_sales_reports_enabled: true,
  is_realtime_updates_enabled: true,
  is_kitchen_display_enabled: true,
  is_offline_order_sync_enabled: false,
  is_online_order_enabled: true,
  is_pay_before_seat_enabled: false,
};

interface FeatureFlagState {
  flags: FeatureFlags;
  // Epoch ms of the last successful fetch — used to throttle re-fetches on tab focus.
  lastFetchedAt: number | null;
}

interface FeatureFlagActions {
  setFlags: (flags: FeatureFlags) => void;
  resetFlags: () => void;
}

type FeatureFlagStore = FeatureFlagState & FeatureFlagActions;

export const useFeatureFlagStore = create<FeatureFlagStore>((set) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  flags: DEFAULT_FLAGS,
  lastFetchedAt: null,

  // ── Actions ────────────────────────────────────────────────────────────────

  setFlags: (flags) =>
    set({
      flags,
      lastFetchedAt: Date.now(),
    }),

  // Called on logout — resets to defaults so stale flags never leak between sessions.
  resetFlags: () =>
    set({
      flags: DEFAULT_FLAGS,
      lastFetchedAt: null,
    }),
}));
