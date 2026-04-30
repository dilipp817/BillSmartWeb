"use client";

import { useEffect, useRef } from "react";

import { validateToken } from "@/features/auth/services/auth-service";
import { TOKEN_VALIDATION_THROTTLE_MS } from "@/constants";
import { useAuthStore } from "@/store/use-auth-store";

/**
 * useTokenValidation — validates the JWT on window focus.
 *
 * Behaviour:
 * - Fires immediately on mount (catches stale sessions after a page refresh)
 * - Re-fires on every window focus event, throttled to at most once per
 *   TOKEN_VALIDATION_THROTTLE_MS (default 60 s) to avoid hammering the backend
 * - If the token is invalid (valid: false) or the call returns 401, the Axios
 *   interceptor handles the redirect to /login automatically
 * - If the user is not authenticated (no session in Zustand), the hook is a no-op
 *   — middleware already guards unauthenticated routes
 *
 * Mount this once in the authenticated layout (N-01 App Shell).
 */
export function useTokenValidation(): void {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const lastCheckedAt = useRef<number>(0);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function check() {
      const now = Date.now();
      if (now - lastCheckedAt.current < TOKEN_VALIDATION_THROTTLE_MS) return;
      lastCheckedAt.current = now;

      try {
        const result = await validateToken();
        if (!result.valid) {
          // Token structurally valid but rejected by backend — force re-login.
          // Use window.location for a full reload so all client state is wiped.
          window.location.href = "/login";
        }
      } catch {
        // 401 is handled by the Axios interceptor (redirect to /login).
        // Any other error (network, 5xx) is silently ignored here — we do not
        // log the user out on a transient server error.
      }
    }

    check();
    window.addEventListener("focus", check);
    return () => window.removeEventListener("focus", check);
  }, [isAuthenticated]);
}
