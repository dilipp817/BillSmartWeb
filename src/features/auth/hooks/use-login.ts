import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { login } from "@/features/auth/services/auth-service";
import type { LoginRequest } from "@/features/auth/types";
import { useAuthStore } from "@/store/use-auth-store";

/**
 * useLogin — wraps the login mutation.
 *
 * @param redirectTo - Path to navigate to on success. Defaults to /dashboard.
 *                     Must be a same-origin path — validated by the login page.
 *
 * On success: stores the user in Zustand and navigates to redirectTo.
 * On error: re-throws so the form can display a user-facing message.
 *
 * The JWT is never touched here — the proxy already set it as an httpOnly cookie.
 */
export function useLogin(redirectTo = "/dashboard") {
  const setUser = useAuthStore((state) => state.setUser);
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (loginResponse) => {
      // loginResponse has the same fields as AuthUser except expires_in/expires_at
      // Build the AuthUser shape from the login response fields
      setUser({
        id: loginResponse.id,
        username: loginResponse.username,
        email: loginResponse.email,
        role: loginResponse.role,
        restaurant_id: loginResponse.restaurant_id,
        is_active: true, // backend only returns active users on login
      });
      router.push(redirectTo);
    },
  });
}
