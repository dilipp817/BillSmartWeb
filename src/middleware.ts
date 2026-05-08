import { type NextRequest, NextResponse } from "next/server";

import { TOKEN_COOKIE } from "@/constants";
import { UserRole } from "@/constants";

/**
 * Routes that require manager or admin role.
 * Staff and kitchen users are redirected to /dashboard.
 */
const MANAGER_ADMIN_ROUTES = ["/reports"];

/**
 * Routes that require admin role only.
 * Staff and manager users are redirected to /dashboard.
 */
const ADMIN_ONLY_ROUTES = ["/menu/management"];

/**
 * Decode the payload segment of a JWT without verifying the signature.
 * Used ONLY for UX routing decisions — never for authorization.
 * Real authorization is enforced by the backend on every API call.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const padded = segment.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Build the Content-Security-Policy header value for a given nonce.
 *
 * Production uses 'nonce-{nonce}' + 'strict-dynamic' so Next.js App Router
 * inline scripts (RSC payloads, hydration) are allowed while arbitrary inline
 * scripts are still blocked.
 *
 * Development allows 'unsafe-eval' and 'unsafe-inline' for HMR / devtools.
 */
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";
  return [
    "default-src 'self'",
    isDev
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
      : `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' http://localhost:*",
    "worker-src 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Generate a per-request nonce for the Content-Security-Policy.
  // Buffer is available in the Next.js Edge Runtime via polyfill.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  /**
   * Create a NextResponse.next() with:
   *  - the nonce forwarded as x-nonce request header (so pages can read it via headers())
   *  - the full CSP forwarded as a request header (Next.js reads this to nonce its own scripts)
   *  - the CSP set on the response (what the browser enforces)
   */
  function nextWithCsp(): NextResponse {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", csp);
    const response = NextResponse.next({ request: { headers: requestHeaders } });
    response.headers.set("Content-Security-Policy", csp);
    return response;
  }

  /** Create a redirect response with the CSP header attached. */
  function redirectWithCsp(url: URL): NextResponse {
    const response = NextResponse.redirect(url);
    response.headers.set("Content-Security-Policy", csp);
    return response;
  }

  // Let /login handle itself below — all other public paths pass through immediately.
  if (pathname !== "/login") {
    const token = request.cookies.get(TOKEN_COOKIE)?.value;

    if (!token) {
      // Unauthenticated — redirect to login, preserve intended destination.
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return redirectWithCsp(loginUrl);
    }

    // Decode role for route-level access control (UX only, not security).
    const payload = decodeJwtPayload(token);
    const role = typeof payload?.role === "string" ? payload.role : null;

    if (MANAGER_ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
      if (role !== UserRole.MANAGER && role !== UserRole.ADMIN) {
        return redirectWithCsp(new URL("/dashboard", request.url));
      }
    }

    if (ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
      if (role !== UserRole.ADMIN) {
        return redirectWithCsp(new URL("/dashboard", request.url));
      }
    }

    return nextWithCsp();
  }

  // /login: authenticated users should not see the login page.
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (token) {
    return redirectWithCsp(new URL("/dashboard", request.url));
  }

  return nextWithCsp();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     *   - _next/static  (Next.js build output)
     *   - _next/image   (image optimisation)
     *   - favicon.ico
     *   - sw.js / workbox-*.js  (Serwist service worker — must be served directly)
     *   - manifest.json (PWA manifest — must be served directly)
     *   - /api/*        (proxy route — auth handled server-side)
     *   - Static image extensions
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sw\\.js|workbox-.*\\.js|manifest\\.json|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
