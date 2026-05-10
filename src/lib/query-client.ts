import { QueryClient, type QueryClientConfig } from "@tanstack/react-query";
import { isAxiosError } from "axios";

const queryClientConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      // Do not retry on 4xx errors — these are client errors, retrying won't help.
      // Only retry on network failures (no response) or 5xx.
      retry: (failureCount, error) => {
        const status = isAxiosError(error) ? error.response?.status : undefined;
        if (status !== undefined && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      // 30 seconds — data older than this is refetched in the background on mount/focus.
      staleTime: 30_000,
      // Keep unused data in cache for 5 minutes before garbage collecting.
      gcTime: 5 * 60 * 1_000,
      // Do not refetch on tab focus — polling hooks handle live order/table data,
      // and focus events during a busy shift would flood the backend.
      refetchOnWindowFocus: false,
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
