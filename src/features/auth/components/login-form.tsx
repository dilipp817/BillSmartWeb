"use client";

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { AxiosError } from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DEVICE_TYPE } from "@/constants";
import { useLogin } from "@/features/auth/hooks/use-login";
import { getOrCreateDeviceId } from "@/features/auth/utils/device-id";
import { loginSchema, type LoginFormValues } from "@/features/auth/utils/login-schema";
import type { ApiErrorResponse } from "@/types";

interface LoginFormProps {
  redirectTo: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate, isPending, error } = useLogin(redirectTo);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: standardSchemaResolver(loginSchema),
  });

  function onSubmit(values: LoginFormValues) {
    mutate({
      ...values,
      device_id: getOrCreateDeviceId(),
      device_type: DEVICE_TYPE,
    });
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">BillSmart</CardTitle>
        <p className="text-muted-foreground text-sm">Sign in to your account</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {error && (
            <div role="alert" className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {getLoginErrorMessage(error)}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              autoComplete="username"
              autoFocus
              disabled={isPending}
              aria-invalid={!!errors.username}
              aria-describedby={errors.username ? "username-error" : undefined}
              {...register("username")}
            />
            {errors.username && (
              <p id="username-error" className="text-destructive text-xs">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                disabled={isPending}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-muted-foreground hover:text-foreground focus-visible:ring-ring absolute top-1/2 right-3 -translate-y-1/2 focus-visible:ring-2 focus-visible:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" className="text-destructive text-xs">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

/**
 * Maps API / network errors to a user-facing message.
 * Never exposes raw backend messages to avoid leaking internals.
 */
function getLoginErrorMessage(error: unknown): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const status = axiosError.response?.status;

  if (status === 401) return "Invalid username or password.";
  if (status === 403) return "Your account does not have permission to access this system.";
  if (status === 429) return "Too many login attempts. Please wait a moment and try again.";
  if (status === 503 || status === 502)
    return "The server is temporarily unavailable. Please try again shortly.";

  if (axiosError.code === "ERR_NETWORK")
    return "Network error. Check your connection and try again.";

  return "Something went wrong. Please try again.";
}
