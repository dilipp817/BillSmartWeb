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

// Shape returned by POST /auth/login (flat object — no nested user field)
export interface LoginResponse {
  token: string;
  username: string;
  role: UserRole;
  restaurant_id: number;
  expires_at: number; // Unix epoch seconds
  message: string;
}
