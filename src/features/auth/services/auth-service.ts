import type { ApiResponse } from "@/types";
import type { AuthUser, LoginResponse, TokenValidation } from "@/types/auth";
import apiClient from "@/lib/axios";
import type { LoginRequest } from "../types";

/**
 * Auth Service — all calls go through the Next.js /api proxy.
 * The proxy attaches the Authorization header from the httpOnly cookie.
 *
 * Layer: Service (API calls only — no state, no redirects, no toasts)
 */

/**
 * POST /api/v1/auth/login
 *
 * The proxy extracts the token from the response, sets it as an httpOnly
 * cookie, and strips it before the response reaches the browser.
 * The returned LoginResponse therefore has no `token` field.
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>("/v1/auth/login", data);
  return response.data.data;
}

/**
 * GET /api/v1/auth/me
 *
 * Returns the full user profile for the current token owner.
 * Used for session recovery on app start.
 */
export async function getMe(): Promise<AuthUser> {
  const response = await apiClient.get<ApiResponse<AuthUser>>("/v1/auth/me");
  return response.data.data;
}

/**
 * POST /api/v1/auth/validate
 *
 * Validates the current JWT and returns its decoded claims.
 * Called on tab focus — throttled by TOKEN_VALIDATION_THROTTLE_MS.
 */
export async function validateToken(): Promise<TokenValidation> {
  const response = await apiClient.post<ApiResponse<TokenValidation>>("/v1/auth/validate");
  return response.data.data;
}

/**
 * POST /api/v1/auth/logout
 *
 * Signals the backend to invalidate the token (best-effort).
 * The proxy also clears the httpOnly cookie on this path.
 */
export async function logout(): Promise<void> {
  await apiClient.post("/v1/auth/logout");
}
