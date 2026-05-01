import type { ReactNode } from "react";

import { AppErrorBoundary } from "@/components/app-error-boundary";
import { AppShellClient } from "@/components/app-shell/app-shell-client";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return (
    <AppErrorBoundary>
      <AppShellClient>{children}</AppShellClient>
    </AppErrorBoundary>
  );
}
