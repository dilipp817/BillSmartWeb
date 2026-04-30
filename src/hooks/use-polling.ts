"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

/**
 * Shared polling hook. Starts polling on mount/focus, stops on unmount/blur.
 * Always pass interval from constants (POLL_INTERVAL_ORDERS, POLL_INTERVAL_TABLES).
 *
 * @param fn      - The function to call on each poll tick
 * @param interval - Poll interval in ms (from constants only)
 */
export function usePolling(fn: () => void, interval: number): void {
  const fnRef = useRef(fn);

  // Keep ref in sync with latest fn after every render, before effects run.
  // useLayoutEffect avoids the "cannot update ref during render" lint error.
  useLayoutEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    let id: ReturnType<typeof setInterval> | null = null;

    const stop = () => {
      if (id !== null) {
        clearInterval(id);
        id = null;
      }
    };

    const start = () => {
      stop();
      fnRef.current();
      id = setInterval(() => fnRef.current(), interval);
    };

    start();
    window.addEventListener("focus", start);
    window.addEventListener("blur", stop);

    return () => {
      stop();
      window.removeEventListener("focus", start);
      window.removeEventListener("blur", stop);
    };
  }, [interval]);
}
