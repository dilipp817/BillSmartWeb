"use client";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import type { ReactNode } from "react";

import { queryClient } from "@/lib/query-client";

interface ProvidersProps {
  children: ReactNode;
}

// Lazily resolved so SSR never touches window.localStorage.
const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  key: "billsmart-query-cache",
});

export function Providers({ children }: ProvidersProps) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        // Discard cache entries older than 24 h — prevents stale order data
        // from being shown if staff leave a device idle overnight.
        maxAge: 24 * 60 * 60 * 1_000,
        // Only persist successful queries — never restore an error state from
        // localStorage, which would flash error UI before the retry fires.
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => query.state.status === "success",
        },
      }}
    >
      {children}
      {process.env.NODE_ENV !== "production" && <ReactQueryDevtools initialIsOpen={false} />}
    </PersistQueryClientProvider>
  );
}
