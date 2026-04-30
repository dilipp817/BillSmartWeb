import { isAxiosError } from "axios";

import type { ApiErrorResponse } from "@/types";

/**
 * Maps an API / network error from the login mutation to a user-facing message.
 * Never exposes raw backend messages to avoid leaking internals.
 */
export function getLoginErrorMessage(error: unknown): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const status = error.response?.status;

    if (status === 401) return "Invalid username or password.";
    if (status === 403) return "Your account does not have permission to access this system.";
    if (status === 429) return "Too many login attempts. Please wait a moment and try again.";
    if (status === 503 || status === 502)
      return "The server is temporarily unavailable. Please try again shortly.";
    if (error.code === "ERR_NETWORK") return "Network error. Check your connection and try again.";
  }

  return "Something went wrong. Please try again.";
}
