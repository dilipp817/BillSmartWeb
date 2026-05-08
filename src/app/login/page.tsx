import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign In — BillSmart",
};

interface LoginPageProps {
  searchParams: Promise<{ from?: string; username?: string; password?: string }>;
}

/**
 * Login page — Server Component.
 *
 * Reads the `from` query param set by middleware when an unauthenticated user
 * tries to access a protected route. Validates it is a same-origin path before
 * passing it to the form to prevent open-redirect attacks.
 *
 * Strips any `username` or `password` query params that may have been injected
 * by a password manager or bookmarked URL — credentials must never appear in URLs.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { from, username, password } = await searchParams;

  // If credentials leaked into the URL, redirect to clean login URL immediately
  if (username ?? password) {
    const cleanUrl =
      from && /^\/[^/]/.test(from) ? `/login?from=${encodeURIComponent(from)}` : "/login";
    redirect(cleanUrl);
  }

  // Reject anything that is not a relative path (prevents open-redirect)
  const redirectTo = from && /^\/[^/]/.test(from) ? from : "/dashboard";

  return (
    <main className="bg-background flex min-h-svh items-center justify-center p-4">
      <LoginForm redirectTo={redirectTo} />
    </main>
  );
}
