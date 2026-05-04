"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { AxiosError } from "axios";

import { queryClient } from "@/lib/query-client";
import { useAuthStore } from "@/store/use-auth-store";
import { toCreateOrderItems, useCartStore } from "@/store/use-cart-store";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { OrderType } from "@/constants";
import type { ApiErrorResponse } from "@/types";

import { createOrder } from "../services/order-service";
import { enqueueOrder } from "./use-offline-order-queue";
import { ORDERS_QUERY_KEY } from "./use-orders";

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseCreateOrderResult {
  /**
   * Submit the current cart as a new order.
   * Optionally pass a free-text notes string (e.g. "Window seat please").
   * Optionally pass a discount amount (MANAGER/ADMIN only) — when provided,
   * navigates directly to /orders/{id}/bill?discount={discount} after creation.
   * Does nothing if the cart is empty or restaurantId is not available.
   *
   * When offline + is_offline_order_sync_enabled=true: queues to IndexedDB.
   * When offline + flag=false: sets an error state.
   */
  submitOrder: (notes?: string, discount?: number) => void;
  isPending: boolean;
  isError: boolean;
  errorMessage: string | null;
  /** True when the last submit failed with HTTP 409 (table already occupied). */
  isConflict: boolean;
  /** True briefly after a successful offline enqueue (so UI can confirm). */
  isOfflineQueued: boolean;
}

/**
 * useCreateOrder — TanStack Query mutation that creates a new order from the
 * current cart state.
 *
 * Online path:
 *   1. POST to backend via createOrder()
 *   2. On success: clear cart → invalidate order queries → navigate to /orders/{id}
 *
 * Offline path (is_offline_order_sync_enabled=true):
 *   1. enqueueOrder() → persist to IndexedDB with PENDING status
 *   2. Clear cart → navigate to /orders (no server ID yet)
 *   3. useOfflineSyncEffect (in AppShellClient) flushes queue on reconnect
 *
 * The Place Order button must be disabled while isPending is true.
 */
export function useCreateOrder(): UseCreateOrderResult {
  const router = useRouter();
  const restaurantId = useAuthStore((state) => state.restaurantId);
  const { items, tableId, orderType, clearCart } = useCartStore();
  const isOnline = useOnlineStatus();
  const isOfflineSyncEnabled = useFeatureFlag("is_offline_order_sync_enabled");

  const [isQueuingOffline, setIsQueuingOffline] = useState(false);
  const [offlineError, setOfflineError] = useState<string | null>(null);
  const [isOfflineQueued, setIsOfflineQueued] = useState(false);
  const [pendingDiscount, setPendingDiscount] = useState<number | undefined>(undefined);

  const mutation = useMutation({
    mutationFn: (notes: string | undefined) => {
      if (!restaurantId) {
        throw new Error("No restaurant context — cannot create order.");
      }
      return createOrder(restaurantId, {
        table_id: tableId,
        order_type: orderType,
        items: toCreateOrderItems(items),
        ...(notes?.trim() && { notes: notes.trim() }),
      });
    },
    onSuccess: (order) => {
      clearCart();
      // Invalidate all order queries so the order list reflects the new order
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
      // When a discount was set by a MANAGER/ADMIN, go straight to bill generation
      if (pendingDiscount !== undefined && pendingDiscount > 0) {
        router.push(`/orders/${order.id}/bill?discount=${pendingDiscount}`);
      } else {
        router.push(`/orders/${order.id}`);
      }
    },
  });

  /** Extract a human-readable message from an Axios 4xx/5xx error. */
  function extractApiError(err: unknown): string {
    const axiosErr = err as AxiosError<ApiErrorResponse>;
    const apiMessage = axiosErr.response?.data?.error?.message;
    if (apiMessage) return apiMessage;
    if (axiosErr.message) return axiosErr.message;
    return "Failed to place order. Please try again.";
  }

  function isConflictError(err: unknown): boolean {
    const axiosErr = err as AxiosError;
    return axiosErr.response?.status === 409;
  }

  const handleOfflineQueue = async (notes?: string) => {
    if (!restaurantId) return;
    setIsQueuingOffline(true);
    setOfflineError(null);
    try {
      await enqueueOrder(restaurantId, {
        table_id: tableId,
        order_type: orderType,
        items: toCreateOrderItems(items),
        ...(notes?.trim() && { notes: notes.trim() }),
      });
      clearCart();
      setIsOfflineQueued(true);
      router.push("/orders");
    } catch {
      setOfflineError("Failed to save order offline. Please try again.");
    } finally {
      setIsQueuingOffline(false);
    }
  };

  const submitOrder = (notes?: string, discount?: number) => {
    if (items.length === 0 || !restaurantId || mutation.isPending || isQueuingOffline) return;

    // DINE_IN requires a table to be selected
    if (orderType === OrderType.DINE_IN && tableId === null) {
      setOfflineError("Please select a table for a Dine In order.");
      return;
    }

    setPendingDiscount(discount);

    if (!isOnline) {
      if (isOfflineSyncEnabled) {
        void handleOfflineQueue(notes);
      } else {
        setOfflineError("No internet connection. Cannot place order.");
      }
      return;
    }

    setOfflineError(null);
    mutation.mutate(notes);
  };

  const errorMessage = offlineError ?? (mutation.isError ? extractApiError(mutation.error) : null);

  return {
    submitOrder,
    isPending: mutation.isPending || isQueuingOffline,
    isError: mutation.isError || offlineError !== null,
    errorMessage,
    isConflict: mutation.isError && isConflictError(mutation.error),
    isOfflineQueued,
  };
}
