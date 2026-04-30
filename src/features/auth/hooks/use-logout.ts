import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { logout } from "@/features/auth/services/auth-service";
import { useAuthStore } from "@/store/use-auth-store";
import { useFeatureFlagStore } from "@/store/use-feature-flag-store";

/**
 * useLogout — clears all client state and redirects to /login.
 *
 * Order of operations:
 * 1. Call POST /auth/logout (proxy clears httpOnly cookie)
 * 2. Clear Zustand auth store
 * 3. Reset feature flags to defaults (prevents stale flags leaking to next user)
 * 4. Clear TanStack Query cache
 * 5. Navigate to /login
 *
 * Best-effort: even if the API call fails, local state is always cleared.
 */
export function useLogout() {
  const clearUser = useAuthStore((state) => state.clearUser);
  const resetFlags = useFeatureFlagStore((state) => state.resetFlags);
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      // Always clear local state regardless of API success/failure
      clearUser();
      resetFlags();
      queryClient.clear();
      router.push("/login");
    },
  });
}
