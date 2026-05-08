"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { currentFlavor } from "@/config/flavor";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/use-auth-store";

import { useSidebarNavItems } from "./use-sidebar-nav-items";

// Shown while useCurrentUser() is still resolving (role === null on page refresh).
// Prevents a flash of empty nav before the session is hydrated from /auth/me.
const SKELETON_COUNT = 5;

function NavSkeleton() {
  return (
    <ul className="space-y-1" aria-label="Loading navigation" aria-busy="true">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <li key={i}>
          <div className="bg-sidebar-accent/50 flex h-9 items-center gap-3 rounded-md px-3">
            <div className="bg-sidebar-foreground/20 size-4 shrink-0 animate-pulse rounded" />
            <div className="bg-sidebar-foreground/20 h-3 w-24 animate-pulse rounded" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const role = useAuthStore((state) => state.role);
  const navItems = useSidebarNavItems();

  return (
    <aside className="border-sidebar-border bg-sidebar flex h-full w-60 shrink-0 flex-col border-r">
      {/* Brand */}
      <div className="border-sidebar-border flex h-16 shrink-0 items-center border-b px-6">
        <span className="text-sidebar-foreground text-lg font-semibold tracking-tight">
          {currentFlavor.displayName}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {role === null ? (
          <NavSkeleton />
        ) : (
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              if (item.isOfflineDisabled) {
                return (
                  <li key={item.href}>
                    <span
                      title="Unavailable offline"
                      className="text-sidebar-foreground/40 flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm font-medium"
                      aria-disabled="true"
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      {item.label}
                    </span>
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      {/* Logout */}
      <div className="border-sidebar-border shrink-0 border-t p-3">
        <LogoutButton />
      </div>
    </aside>
  );
}
