"use client";

import type { ReactNode } from "react";

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
 * Mounts session-level hooks once for the entire authenticated session:
 *  1. useFeatureFlags — fetches flags once after login; served from localStorage on subsequent loads
 *
 * Auth state is hydrated from localStorage via Zustand persist — no /auth/me call needed.
 * Backend keep-alive is handled server-side by the backend team.
 * Renders: sidebar (left) + header (top) + scrollable page content (right/main).
 * Mount once at the (authenticated) route group layout — never per-page.
 */
export function AppShellClient({ children }: AppShellClientProps) {
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
