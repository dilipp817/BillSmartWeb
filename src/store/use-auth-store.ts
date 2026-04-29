"use client";

import { create } from "zustand";
import type { AuthUser } from "@/types";
import type { UserRole } from "@/constants";

interface AuthState {
  user: AuthUser | null;
  // Convenience selectors — derived from user, no duplication
  role: UserRole | null;
  restaurantId: number | null;
  isAuthenticated: boolean;
}

interface AuthActions {
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  // ── Initial state ──────────────────────────────────────────────────────────
  user: null,
  role: null,
  restaurantId: null,
  isAuthenticated: false,

  // ── Actions ────────────────────────────────────────────────────────────────

  setUser: (user) =>
    set({
      user,
      role: user.role,
      restaurantId: user.restaurant_id,
      isAuthenticated: true,
    }),

  clearUser: () =>
    set({
      user: null,
      role: null,
      restaurantId: null,
      isAuthenticated: false,
    }),
}));
