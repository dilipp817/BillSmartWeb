"use client";

import { useAuthStore } from "@/store/use-auth-store";
import { useFeatureFlagStore } from "@/store/use-feature-flag-store";

import { NAV_ITEMS, type NavItem } from "./nav-config";

/**
 * Returns the nav items the current user is allowed to see.
 * Filters by role and active feature flags.
 * Logic lives here (hook), not in the Sidebar component.
 */
export function useSidebarNavItems(): NavItem[] {
  const role = useAuthStore((state) => state.role);
  const flags = useFeatureFlagStore((state) => state.flags);

  return NAV_ITEMS.filter((item) => {
    if (role === null || !item.roles.includes(role)) return false;
    if (item.featureFlag !== undefined && !flags[item.featureFlag]) return false;
    return true;
  });
}
