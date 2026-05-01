"use client";

import { useOnlineStatus } from "@/hooks/use-online-status";
import { useAuthStore } from "@/store/use-auth-store";
import { useFeatureFlagStore } from "@/store/use-feature-flag-store";

import { NAV_ITEMS, type NavItem } from "./nav-config";

export interface ComputedNavItem extends NavItem {
  /** True when the browser is offline and this item has disabledOffline: true */
  isOfflineDisabled: boolean;
}

/**
 * Returns the nav items the current user is allowed to see, each annotated with
 * isOfflineDisabled so the Sidebar can grey them out without removing them.
 * Filters by role and active feature flags.
 * Logic lives here (hook), not in the Sidebar component.
 */
export function useSidebarNavItems(): ComputedNavItem[] {
  const role = useAuthStore((state) => state.role);
  const flags = useFeatureFlagStore((state) => state.flags);
  const isOnline = useOnlineStatus();

  return NAV_ITEMS.filter((item) => {
    if (role === null || !item.roles.includes(role)) return false;
    if (item.featureFlag !== undefined && !flags[item.featureFlag]) return false;
    return true;
  }).map((item) => ({
    ...item,
    isOfflineDisabled: !isOnline && (item.disabledOffline ?? false),
  }));
}
