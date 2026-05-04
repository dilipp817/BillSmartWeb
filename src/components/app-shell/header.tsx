"use client";

import { useQuery } from "@tanstack/react-query";
import { Building2, Wifi, WifiOff } from "lucide-react";

import { UserRole } from "@/constants";
import { useAuthStore } from "@/store/use-auth-store";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { getRestaurant } from "@/features/settings/services/restaurant-service";
import { RESTAURANT_SETTINGS_QUERY_KEY } from "@/features/settings/hooks/use-restaurant-settings";

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.STAFF]: "Staff",
  [UserRole.MANAGER]: "Manager",
  [UserRole.ADMIN]: "Admin",
};

export function Header() {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const isOnline = useOnlineStatus();

  const { data: restaurant } = useQuery({
    queryKey: [...RESTAURANT_SETTINGS_QUERY_KEY, restaurantId],
    queryFn: () => getRestaurant(restaurantId!),
    enabled: restaurantId !== null,
    // Restaurant name rarely changes — 10 min stale time, no background polling
    staleTime: 10 * 60 * 1_000,
  });

  const branchName = restaurant?.displayname ?? restaurant?.outlet_name ?? null;

  return (
    <header className="bg-background flex h-16 shrink-0 items-center justify-between border-b px-6">
      {/* Left slot — branch name */}
      <div className="flex items-center gap-2">
        {branchName && (
          <>
            <Building2 className="text-muted-foreground size-4 shrink-0" />
            <span className="text-sm font-medium">{branchName}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Online / Offline indicator */}
        {isOnline ? (
          <span className="flex items-center gap-1.5 text-xs text-green-600">
            <Wifi className="size-3.5" />
            Online
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-amber-600">
            <WifiOff className="size-3.5" />
            Offline
          </span>
        )}

        {user && (
          <>
            <span className="text-muted-foreground text-sm">{user.username}</span>
            {role && (
              <span className="bg-accent text-accent-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
                {ROLE_LABELS[role]}
              </span>
            )}
          </>
        )}
      </div>
    </header>
  );
}
