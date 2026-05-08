"use client";

import type { ReactNode } from "react";

import { useCurrentUser } from "@/features/auth/hooks/use-current-user";
import { useFeatureFlags } from "@/features/auth/hooks/use-feature-flags";
import { useOfflineSyncEffect } from "@/features/orders/hooks/use-offline-order-queue";

import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { OfflineBanner } from "@/components/offline-banner";
import { OfflineSyncNotice } from "@/components/offline-sync-notice";

interface AppShellClientProps {
  children: ReactNode;
}

/**
 * AppShellClient — the authenticated shell.
 *
 * Mounts the auth hooks once for the entire authenticated session:
 *  1. useCurrentUser  — session recovery from /auth/me on page refresh
 *  2. useFeatureFlags — re-fetches flags on mount + tab focus (throttled 15 min)
 *
 * Renders: sidebar (left) + header (top) + scrollable page content (right/main).
 * Mount once at the (authenticated) route group layout — never per-page.
 */
export function AppShellClient({ children }: AppShellClientProps) {
  useCurrentUser();
  useFeatureFlags();
  const { syncedCount } = useOfflineSyncEffect();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <OfflineBanner />
        <OfflineSyncNotice syncedCount={syncedCount} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
