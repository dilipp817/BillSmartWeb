import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Sign In — BillSmart",
};

interface LoginPageProps {
  searchParams: Promise<{ from?: string }>;
}

/**
 * Login page — Server Component.
 *
 * Reads the `from` query param set by middleware when an unauthenticated user
 * tries to access a protected route. Validates it is a same-origin path before
 * passing it to the form to prevent open-redirect attacks.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { from } = await searchParams;

  // Reject anything that is not a relative path (prevents open-redirect)
  const redirectTo = from && /^\/[^/]/.test(from) ? from : "/dashboard";

  return (
    <main className="bg-background flex min-h-svh items-center justify-center p-4">
      <LoginForm redirectTo={redirectTo} />
    </main>
  );
}
