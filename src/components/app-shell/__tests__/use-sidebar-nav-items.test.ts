import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UserRole } from "@/constants";
import type { FeatureFlags } from "@/store/use-feature-flag-store";

import { useSidebarNavItems } from "../use-sidebar-nav-items";

// ── Mock Zustand stores ────────────────────────────────────────────────────────
// Both stores use selector pattern: store(state => state.x).
// We make the mock call the selector with a fake state object.

const authState = { role: null as UserRole | null };
const flagState: FeatureFlags = {
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

vi.mock("@/store/use-auth-store", () => ({
  useAuthStore: vi.fn((selector: (s: typeof authState) => unknown) => selector(authState)),
}));

vi.mock("@/store/use-feature-flag-store", () => ({
  useFeatureFlagStore: vi.fn((selector: (s: { flags: FeatureFlags }) => unknown) =>
    selector({ flags: flagState })
  ),
}));

// Helper: update mutable state refs before each test
function setRole(role: UserRole | null) {
  authState.role = role;
}
function setFlag<K extends keyof FeatureFlags>(key: K, value: boolean) {
  flagState[key] = value;
}

beforeEach(() => {
  // Reset to logged-in admin with all default flags before each test
  authState.role = UserRole.ADMIN;
  flagState.is_table_management_enabled = true;
  flagState.is_sales_reports_enabled = true;
});

// ── Label helpers ──────────────────────────────────────────────────────────────
function labels(result: ReturnType<typeof useSidebarNavItems>) {
  return result.map((i) => i.label);
}

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("useSidebarNavItems — role filtering", () => {
  it("returns empty array when role is null (session loading)", () => {
    setRole(null);
    const { result } = renderHook(() => useSidebarNavItems());
    expect(result.current).toHaveLength(0);
  });

  it("STAFF sees Dashboard, Orders, Tables, Menu, Settings — not Reports or Manage Menu", () => {
    setRole(UserRole.STAFF);
    const { result } = renderHook(() => useSidebarNavItems());
    const shown = labels(result.current);
    expect(shown).toContain("Dashboard");
    expect(shown).toContain("Orders");
    expect(shown).not.toContain("Billing");
    expect(shown).toContain("Tables");
    expect(shown).toContain("Menu");
    expect(shown).toContain("Settings");
    expect(shown).not.toContain("Reports");
    expect(shown).not.toContain("Manage Menu");
  });

  it("MANAGER sees Dashboard, Orders, Tables, Reports, Menu, Settings — not Manage Menu", () => {
    setRole(UserRole.MANAGER);
    const { result } = renderHook(() => useSidebarNavItems());
    const shown = labels(result.current);
    expect(shown).toContain("Dashboard");
    expect(shown).toContain("Orders");
    expect(shown).not.toContain("Billing");
    expect(shown).toContain("Tables");
    expect(shown).toContain("Reports");
    expect(shown).toContain("Menu");
    expect(shown).toContain("Settings");
    expect(shown).not.toContain("Manage Menu");
  });

  it("ADMIN sees all nav items", () => {
    setRole(UserRole.ADMIN);
    const { result } = renderHook(() => useSidebarNavItems());
    const shown = labels(result.current);
    expect(shown).toContain("Dashboard");
    expect(shown).toContain("Orders");
    expect(shown).not.toContain("Billing");
    expect(shown).toContain("Tables");
    expect(shown).toContain("Reports");
    expect(shown).toContain("Menu");
    expect(shown).toContain("Settings");
  });
});

describe("useSidebarNavItems — feature flag filtering", () => {
  it("hides Tables for all roles when is_table_management_enabled is false", () => {
    setFlag("is_table_management_enabled", false);

    for (const role of [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN]) {
      setRole(role);
      const { result } = renderHook(() => useSidebarNavItems());
      expect(labels(result.current)).not.toContain("Tables");
    }
  });

  it("shows Tables for all roles when is_table_management_enabled is true", () => {
    setFlag("is_table_management_enabled", true);

    for (const role of [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN]) {
      setRole(role);
      const { result } = renderHook(() => useSidebarNavItems());
      expect(labels(result.current)).toContain("Tables");
    }
  });

  it("hides Reports when is_sales_reports_enabled is false", () => {
    setFlag("is_sales_reports_enabled", false);

    for (const role of [UserRole.MANAGER, UserRole.ADMIN]) {
      setRole(role);
      const { result } = renderHook(() => useSidebarNavItems());
      expect(labels(result.current)).not.toContain("Reports");
    }
  });

  it("shows Reports for MANAGER and ADMIN when is_sales_reports_enabled is true", () => {
    setFlag("is_sales_reports_enabled", true);

    for (const role of [UserRole.MANAGER, UserRole.ADMIN]) {
      setRole(role);
      const { result } = renderHook(() => useSidebarNavItems());
      expect(labels(result.current)).toContain("Reports");
    }
  });

  it("STAFF never sees Reports regardless of is_sales_reports_enabled flag", () => {
    setFlag("is_sales_reports_enabled", true);
    setRole(UserRole.STAFF);
    const { result } = renderHook(() => useSidebarNavItems());
    expect(labels(result.current)).not.toContain("Reports");
  });
});

describe("useSidebarNavItems — nav order", () => {
  it("returns items in definition order (Dashboard first, Settings last)", () => {
    setRole(UserRole.ADMIN);
    const { result } = renderHook(() => useSidebarNavItems());
    const shown = labels(result.current);
    expect(shown[0]).toBe("Dashboard");
    expect(shown[shown.length - 1]).toBe("Settings");
  });
});

describe("useSidebarNavItems — href correctness", () => {
  it("each nav item has a valid same-origin href", () => {
    setRole(UserRole.ADMIN);
    const { result } = renderHook(() => useSidebarNavItems());
    for (const item of result.current) {
      expect(item.href).toMatch(/^\/[a-z]/);
    }
  });
});
