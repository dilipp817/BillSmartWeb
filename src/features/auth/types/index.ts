// Re-export shared auth types for use within the auth feature
export type { AuthUser, LoginResponse, TokenValidation } from "@/types/auth";

export interface LoginRequest {
  username: string;
  password: string;
  device_id: string;
  device_type: string;
}
