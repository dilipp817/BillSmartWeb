"use client";

import { useEffect } from "react";

import { getFeatureFlags } from "@/features/auth/services/feature-flag-service";
import { useAuthStore } from "@/store/use-auth-store";
import { useFeatureFlagStore } from "@/store/use-feature-flag-store";

/**
 * useFeatureFlags — fetches feature flags once after login and persists them.
 *
 * Flags are stored in Zustand with localStorage persistence so they survive
 * page refreshes without a network call. A fetch only fires when lastFetchedAt
 * is null — i.e. on first login or after logout (resetFlags clears the timestamp).
 *
 * Error handling:
 *  - 401 → Axios interceptor handles it (redirect to /login)
 *  - Other errors (network, 5xx) → silently ignored; app continues with
 *    default/cached flags. Never crash on a missing flag.
 *
 * Mount once in the authenticated app shell.
 */
export function useFeatureFlags(): void {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const restaurantId = useAuthStore((state) => state.restaurantId);

  useEffect(() => {
    if (!isAuthenticated || restaurantId === null) return;

    const safeId = restaurantId;

    async function fetchFlags() {
      // Read fresh values from store — avoids stale closures.
      const { lastFetchedAt, setFlags } = useFeatureFlagStore.getState();

      // Already fetched this session (persisted from localStorage) — skip.
      if (lastFetchedAt !== null) return;

      try {
        const flags = await getFeatureFlags(safeId);
        setFlags(flags);
      } catch {
        // Silently ignored — app continues with default/cached flags.
        // 401 is handled globally by the Axios interceptor.
      }
    }

    fetchFlags();
  }, [isAuthenticated, restaurantId]);
}
