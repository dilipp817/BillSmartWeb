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
 */
export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery<AuthUser>({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async () => {
      const user = await getMe();
      setUser(user);
      return user;
    },
    // Do not retry on failure — if /auth/me fails, user needs to re-login
    retry: false,
    // Keep data fresh for 5 minutes — session is validated separately on tab focus (A-04)
    staleTime: 5 * 60 * 1_000,
  });
}
