import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";
import type { AxiosError } from "axios";

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // Do not retry on 4xx errors — these are client errors, retrying won't help.
      // Only retry on network failures (no response) or 5xx.
      retry: (failureCount, error) => {
        const status = (error as AxiosError)?.response?.status;
        if (status !== undefined && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      // 30 seconds — data older than this is refetched in the background on mount/focus.
      staleTime: 30_000,
      // Keep unused data in cache for 5 minutes before garbage collecting.
      gcTime: 5 * 60 * 1_000,
      // Refetch when the browser tab regains focus (catches session expiry, stale orders).
      refetchOnWindowFocus: true,
      // Do not refetch on reconnect by default — polling hooks handle live data.
      refetchOnReconnect: false,
    },
    mutations: {
      // Never retry mutations — financial operations must not be duplicated.
      retry: false,
    },
  },
};

export const queryClient = new QueryClient(queryClientConfig);
