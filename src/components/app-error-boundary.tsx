"use client";

import { ErrorBoundary } from "react-error-boundary";
import type { ReactNode } from "react";

function ErrorFallback() {
  return (
    <div className="text-muted-foreground flex h-full w-full items-center justify-center p-8 text-center text-sm">
      Something went wrong. Please refresh the page.
    </div>
  );
}

interface AppErrorBoundaryProps {
  children: ReactNode;
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>;
}
