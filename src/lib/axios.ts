import axios, { type AxiosError, type AxiosResponse } from "axios";
import type { ApiErrorResponse } from "@/types";

/**
 * Client-side Axios instance.
 *
 * All requests go to Next.js /api/... proxy routes — never directly to the
 * Spring Boot backend. The proxy reads the JWT from the httpOnly cookie and
 * attaches the Authorization header server-side.
 */
const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // send httpOnly cookie on every request
});

// ─── Response interceptor ────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      // Token missing or expired — redirect to login immediately.
      // Use window.location so the full page reloads and all client state clears.
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    // Re-throw so individual call sites can handle 403, 409, 422, etc.
    return Promise.reject(error);
  }
);

export default apiClient;
