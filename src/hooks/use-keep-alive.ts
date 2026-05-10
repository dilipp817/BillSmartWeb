"use client";

import { useEffect } from "react";

import { KEEP_ALIVE_INTERVAL_MS } from "@/constants/app";

/**
 * useKeepAlive — pings the backend every 14 minutes to prevent Render
 * free-tier cold starts (instances spin down after 15 min idle).
 *
 * The ping goes to /api/keep-alive (a Next.js route) which calls the backend
 * server-side, so the backend URL is never exposed to the browser.
 *
 * Fire-and-forget: errors are silently ignored. This is a best-effort
 * optimisation, not a critical path.
 */
export function useKeepAlive(): void {
  useEffect(() => {
    function ping() {
      fetch("/api/keep-alive").catch(() => {
        // Silently ignored — network errors don't affect app functionality.
      });
    }

    // Ping immediately on mount so the very first load can benefit if the
    // backend is cold (slightly races, but still reduces subsequent cold starts).
    ping();

    const id = setInterval(ping, KEEP_ALIVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
}
