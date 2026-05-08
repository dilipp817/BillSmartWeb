import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Receipt,
  Settings,
  TableProperties,
  Tag,
  Utensils,
  UtensilsCrossed,
} from "lucide-react";

import { UserRole } from "@/constants";
import type { FeatureFlags } from "@/store/use-feature-flag-store";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
  featureFlag?: keyof FeatureFlags;
  /** When true, item is greyed-out and unclickable while the browser is offline. */
  disabledOffline?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    href: "/orders",
    label: "Orders",
    icon: ClipboardList,
    roles: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    href: "/billing",
    label: "Billing",
    icon: Receipt,
    roles: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
    disabledOffline: true,
  },
  {
    href: "/tables",
    label: "Tables",
    icon: TableProperties,
    roles: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
    featureFlag: "is_table_management_enabled",
    disabledOffline: true,
  },
  {
    href: "/reports",
    label: "Reports",
    icon: BarChart3,
    roles: [UserRole.MANAGER, UserRole.ADMIN],
    featureFlag: "is_sales_reports_enabled",
    disabledOffline: true,
  },
  {
    href: "/menu",
    label: "Menu",
    icon: Utensils,
    roles: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
  {
    href: "/menu/management",
    label: "Manage Menu",
    icon: UtensilsCrossed,
    roles: [UserRole.ADMIN],
  },
  {
    href: "/categories",
    label: "Categories",
    icon: Tag,
    roles: [UserRole.ADMIN],
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    roles: [UserRole.STAFF, UserRole.MANAGER, UserRole.ADMIN],
  },
];
