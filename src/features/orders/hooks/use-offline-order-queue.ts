import { useEffect, useRef, useState } from "react";

import {
  OFFLINE_ORDER_REF_PREFIX,
  OFFLINE_SYNC_NOTIFICATION_DURATION_MS,
  OfflineSyncStatus,
} from "@/constants";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { db, type OfflineOrderQueueEntry } from "@/lib/db";
import { useAuthStore } from "@/store/use-auth-store";

import { createOrder } from "../services/order-service";
import type { CreateOrderRequest } from "../types";

// ─── Enqueue ──────────────────────────────────────────────────────────────────

/**
 * Persist an order to the offline queue (IndexedDB).
 *
 * Generates a unique reference number as an idempotency key and sets
 * syncStatus to PENDING. Call this in place of createOrder() when offline.
 * Must be called BEFORE any retry loop — reference is generated once here.
 */
export async function enqueueOrder(
  restaurantId: number,
  payload: CreateOrderRequest
): Promise<void> {
  const rand = Math.random().toString(36).slice(2, 6);
  const referenceNumber = `${OFFLINE_ORDER_REF_PREFIX}-${Date.now()}-${rand}`;

  await db.offlineOrderQueue.add({
    restaurantId,
    payload,
    referenceNumber,
    createdAt: new Date().toISOString(),
    syncStatus: OfflineSyncStatus.PENDING,
    retryCount: 0,
  } as OfflineOrderQueueEntry);
}

// ─── Sync Effect ──────────────────────────────────────────────────────────────

export interface UseOfflineSyncEffectResult {
  /**
   * Number of orders successfully synced in the latest run.
   * Auto-resets to 0 after OFFLINE_SYNC_NOTIFICATION_DURATION_MS.
   */
  syncedCount: number;
}

/**
 * useOfflineSyncEffect — mount once in AppShellClient.
 *
 * Watches the online/offline transition. When the browser comes back online:
 *   1. Reads all PENDING entries for the current restaurant from IndexedDB
 *   2. Calls createOrder() for each — sequential, never parallel (avoids duplicates)
 *   3. Marks each SYNCED (success) or FAILED (error), incrementing retryCount
 *   4. Exposes syncedCount for a brief success notification in the shell
 *
 * Gated by `is_offline_order_sync_enabled` feature flag.
 * Does nothing if the flag is false or if there were no queued orders.
 */
export function useOfflineSyncEffect(): UseOfflineSyncEffectResult {
  const isOnline = useOnlineStatus();
  const isEnabled = useFeatureFlag("is_offline_order_sync_enabled");
  const restaurantId = useAuthStore((state) => state.restaurantId);

  const [syncedCount, setSyncedCount] = useState(0);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks whether we were offline so we can detect the offline → online transition
  const wasPreviouslyOfflineRef = useRef(!isOnline);

  useEffect(() => {
    if (!isOnline) {
      wasPreviouslyOfflineRef.current = true;
      return;
    }

    // Only sync on offline → online transition, not on initial online mount
    if (!wasPreviouslyOfflineRef.current) return;
    wasPreviouslyOfflineRef.current = false;

    if (!isEnabled || restaurantId === null) return;

    async function syncQueue() {
      const pending = await db.offlineOrderQueue
        .where("syncStatus")
        .equals(OfflineSyncStatus.PENDING)
        .filter((entry) => entry.restaurantId === restaurantId!)
        .toArray();

      if (pending.length === 0) return;

      let synced = 0;

      for (const entry of pending) {
        try {
          await db.offlineOrderQueue.update(entry.id!, {
            syncStatus: OfflineSyncStatus.SYNCING,
          });
          await createOrder(restaurantId!, entry.payload);
          await db.offlineOrderQueue.update(entry.id!, {
            syncStatus: OfflineSyncStatus.SYNCED,
          });
          synced++;
        } catch {
          await db.offlineOrderQueue.update(entry.id!, {
            syncStatus: OfflineSyncStatus.FAILED,
            retryCount: entry.retryCount + 1,
            errorMessage: "Failed to sync on reconnect",
          });
        }
      }

      if (synced > 0) {
        setSyncedCount(synced);
        if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
        clearTimerRef.current = setTimeout(
          () => setSyncedCount(0),
          OFFLINE_SYNC_NOTIFICATION_DURATION_MS
        );
      }
    }

    void syncQueue();
  }, [isOnline, isEnabled, restaurantId]);

  // Clean up the auto-dismiss timer on unmount
  useEffect(() => {
    return () => {
      if (clearTimerRef.current) clearTimeout(clearTimerRef.current);
    };
  }, []);

  return { syncedCount };
}
