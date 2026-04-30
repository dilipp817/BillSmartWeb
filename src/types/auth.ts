import type { UserRole } from "@/constants";

// Shape returned by GET /auth/me and stored in the auth store.
export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  restaurant_id: number;
  is_active: boolean;
}

// Shape returned by POST /auth/validate
export interface TokenValidation {
  valid: boolean;
  username: string;
  user_id: number;
  role: UserRole;
  restaurant_id: number | null; // null for super_admin accounts
}

// Shape returned by POST /auth/login (flat object — no nested user field).
// NOTE: `token` is intentionally absent — the Next.js proxy extracts it,
// sets it as an httpOnly cookie, and strips it before the response reaches the browser.
export interface LoginResponse {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  restaurant_id: number;
  expires_in: number; // seconds until expiry
  expires_at: number; // Unix epoch seconds
}
