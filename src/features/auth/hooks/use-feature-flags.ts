"use client";

import { useEffect } from "react";

import { FLAG_REFETCH_THROTTLE_MS } from "@/constants/app";
import { getFeatureFlags } from "@/features/auth/services/feature-flag-service";
import { useAuthStore } from "@/store/use-auth-store";
import { useFeatureFlagStore } from "@/store/use-feature-flag-store";

/**
 * useFeatureFlags — fetches feature flags on mount and on every tab focus.
 *
 * Throttled by FLAG_REFETCH_THROTTLE_MS (15 min). The throttle timestamp is
 * stored in Zustand so it survives component remounts (e.g. route navigation).
 *
 * Error handling:
 *  - 401 → Axios interceptor handles it (redirect to /login)
 *  - Other errors (network, 5xx) → silently ignored; app continues with
 *    default/cached flags. Never crash on a missing flag.
 *
 * Mount once in the authenticated app shell (N-01).
 */
export function useFeatureFlags(): void {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const restaurantId = useAuthStore((state) => state.restaurantId);

  useEffect(() => {
    if (!isAuthenticated || restaurantId === null) return;

    // Capture the narrowed value so the async closure always has `number`,
    // not `number | null` — avoids a type assertion inside fetchFlags.
    const safeId = restaurantId;

    async function fetchFlags() {
      const now = Date.now();
      // Read fresh values from the store at call time — avoids stale closures
      // and ensures the throttle check always uses the latest lastFetchedAt.
      const { lastFetchedAt, setFlags } = useFeatureFlagStore.getState();

      if (lastFetchedAt !== null && now - lastFetchedAt < FLAG_REFETCH_THROTTLE_MS) return;

      try {
        const flags = await getFeatureFlags(safeId);
        setFlags(flags);
      } catch {
        // Silently ignored — app continues with default/cached flags.
        // 401 is handled globally by the Axios interceptor.
      }
    }

    fetchFlags();
    window.addEventListener("focus", fetchFlags);
    return () => window.removeEventListener("focus", fetchFlags);
  }, [isAuthenticated, restaurantId]);
}
