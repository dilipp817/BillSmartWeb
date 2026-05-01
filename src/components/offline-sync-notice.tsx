"use client";

import { CheckCircle2 } from "lucide-react";

interface OfflineSyncNoticeProps {
  syncedCount: number;
}

/**
 * OfflineSyncNotice — renders a brief green confirmation strip when offline
 * orders have just been synced after reconnecting.
 * Renders nothing when syncedCount is 0.
 * Auto-dismissed by the parent hook after OFFLINE_SYNC_NOTIFICATION_DURATION_MS.
 */
export function OfflineSyncNotice({ syncedCount }: OfflineSyncNoticeProps) {
  if (syncedCount === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 bg-green-600 px-6 py-2 text-sm text-white"
    >
      <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
      <span>
        {syncedCount} offline order{syncedCount > 1 ? "s" : ""} synced successfully.
      </span>
    </div>
  );
}
