"use client";

import { Loader2, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/use-logout";

/**
 * LogoutButton — triggers the full logout flow.
 *
 * Uses useLogout which (in order):
 *  1. POST /auth/logout  → proxy clears the httpOnly bs_token cookie
 *  2. Clears Zustand auth store  (user, role, restaurantId, isAuthenticated)
 *  3. Resets feature flags to defaults  (prevents stale flags for next user)
 *  4. Clears TanStack Query cache
 *  5. router.push("/login")
 *
 * Even if the API call fails, local state is always cleared (onSettled).
 *
 * Place this in the authenticated app shell sidebar / header (N-01).
 */
export function LogoutButton() {
  const { mutate, isPending } = useLogout();

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={isPending}
      onClick={() => mutate()}
      aria-label="Sign out"
    >
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      <span className="ml-2">{isPending ? "Signing out…" : "Sign out"}</span>
    </Button>
  );
}
