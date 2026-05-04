"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
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

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // ── Initial state ────────────────────────────────────────────────────────
      user: null,
      role: null,
      restaurantId: null,
      isAuthenticated: false,

      // ── Actions ──────────────────────────────────────────────────────────────

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
    }),
    {
      name: "billsmart-auth",
      // Persist only the data fields — actions are not serialisable
      partialize: (state) => ({
        user: state.user,
        role: state.role,
        restaurantId: state.restaurantId,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
