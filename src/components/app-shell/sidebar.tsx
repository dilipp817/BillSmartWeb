"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/features/auth/components/logout-button";
import { cn } from "@/lib/utils";

import { useSidebarNavItems } from "./use-sidebar-nav-items";

export function Sidebar() {
  const pathname = usePathname();
  const navItems = useSidebarNavItems();

  return (
    <aside className="border-sidebar-border bg-sidebar flex h-full w-60 shrink-0 flex-col border-r">
      {/* Brand */}
      <div className="border-sidebar-border flex h-16 shrink-0 items-center border-b px-6">
        <span className="text-sidebar-foreground text-lg font-semibold tracking-tight">
          BillSmart
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

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
      </nav>

      {/* Logout */}
      <div className="border-sidebar-border shrink-0 border-t p-3">
        <LogoutButton />
      </div>
    </aside>
  );
}
