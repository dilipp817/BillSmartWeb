"use client";

import { WifiOff } from "lucide-react";

import { useOnlineStatus } from "@/hooks/use-online-status";

/**
 * OfflineBanner — renders a red alert strip when the browser has no network connection.
 * Renders nothing when online. Listens to window online/offline events in real time.
 */
export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="bg-destructive text-destructive-foreground flex items-center gap-2 px-6 py-2 text-sm"
    >
      <WifiOff className="size-4 shrink-0" aria-hidden="true" />
      <span>
        You are offline. Table management and live sync are unavailable. Ordering and printing
        continue to work.
      </span>
    </div>
  );
}
