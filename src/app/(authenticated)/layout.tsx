import type { ReactNode } from "react";

import { AppShellClient } from "@/components/app-shell/app-shell-client";

interface AuthenticatedLayoutProps {
  children: ReactNode;
}

export default function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  return <AppShellClient>{children}</AppShellClient>;
}
