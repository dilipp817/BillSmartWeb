"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { getMe } from "@/features/auth/services/auth-service";
import type { AuthUser } from "@/features/auth/types";
import { useAuthStore } from "@/store/use-auth-store";

export const CURRENT_USER_QUERY_KEY = ["auth", "me"] as const;

/**
 * useCurrentUser — fetches and caches the current user profile.
 *
 * Used for session recovery on app start (e.g. page refresh).
 * On success: populates the Zustand auth store so role checks work immediately.
 * On 401: the Axios interceptor redirects to /login automatically.
 *
 * setUser is applied in a useEffect (not inside queryFn) so it only fires when
 * data actually changes — not on every background refetch tick.
 */
export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser);

  const query = useQuery<AuthUser>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: getMe,
    // Do not retry on failure — if /auth/me fails, user needs to re-login
    retry: false,
    // Keep data fresh for 5 minutes — session is validated separately on tab focus (A-04)
    staleTime: 5 * 60 * 1_000,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  return query;
}
