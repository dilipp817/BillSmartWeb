"use client";

import { UserRole } from "@/constants";
import { useAuthStore } from "@/store/use-auth-store";

const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.STAFF]: "Staff",
  [UserRole.MANAGER]: "Manager",
  [UserRole.ADMIN]: "Admin",
};

export function Header() {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  return (
    <header className="bg-background flex h-16 shrink-0 items-center justify-between border-b px-6">
      {/* Left slot — page title injected via layout composition from N-03 onwards */}
      <div />

      <div className="flex items-center gap-3">
        {user && (
          <>
            <span className="text-muted-foreground text-sm">{user.username}</span>
            {role && (
              <span className="bg-accent text-accent-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
                {ROLE_LABELS[role]}
              </span>
            )}
          </>
        )}
      </div>
    </header>
  );
}
