import Dexie, { type EntityTable } from "dexie";

import { OfflineSyncStatus } from "@/constants";
import type { CreateOrderRequest } from "@/features/orders/types";

// ─── Offline Order Queue ──────────────────────────────────────────────────────

export interface OfflineOrderQueueEntry {
  id?: number;
  restaurantId: number;
  payload: CreateOrderRequest;
  referenceNumber: string; // idempotency key — generated before network call
  createdAt: string;
  syncStatus: OfflineSyncStatus;
  retryCount: number;
  errorMessage?: string;
}

// ─── Database ─────────────────────────────────────────────────────────────────

class BillSmartDatabase extends Dexie {
  offlineOrderQueue!: EntityTable<OfflineOrderQueueEntry, "id">;

  constructor() {
    super("BillSmartDB");
    this.version(1).stores({
      // Indexed columns: restaurantId (filter by outlet), syncStatus (filter pending),
      // createdAt (order by queue time). Non-indexed fields (payload etc.) stored but not queried.
      offlineOrderQueue: "++id, restaurantId, syncStatus, createdAt",
    });
  }
}

export const db = new BillSmartDatabase();
