"use client";

import type { ReactNode } from "react";

import { UserRole } from "@/constants";
import { useAuthStore } from "@/store/use-auth-store";

interface RoleGuardProps {
  /** Roles that are permitted to see the children. */
  allowedRoles: UserRole[];
  /** Rendered when the current user's role is not in allowedRoles. Defaults to null. */
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * RoleGuard — hides children entirely when the current user's role is not
 * in allowedRoles. This is a UX-only guard; backend enforces real auth.
 *
 * Usage:
 *   <RoleGuard allowedRoles={[UserRole.ADMIN]}>
 *     <DeleteButton />
 *   </RoleGuard>
 */
export function RoleGuard({ allowedRoles, fallback = null, children }: RoleGuardProps) {
  const role = useAuthStore((state) => state.role);

  if (role === null || !allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
