import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

/**
 * Returns the current online/offline status of the browser.
 * Uses useSyncExternalStore so SSR always renders true (no hydration mismatch)
 * and the client subscribes to window online/offline events in real time.
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine, // client snapshot
    () => true // server snapshot — always online during SSR
  );
}
