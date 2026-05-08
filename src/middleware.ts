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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let /login handle itself below — all other public paths pass through immediately.
  if (pathname !== "/login") {
    const token = request.cookies.get(TOKEN_COOKIE)?.value;

    if (!token) {
      // Unauthenticated — redirect to login, preserve intended destination.
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Decode role for route-level access control (UX only, not security).
    const payload = decodeJwtPayload(token);
    const role = typeof payload?.role === "string" ? payload.role : null;

    if (MANAGER_ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
      if (role !== UserRole.MANAGER && role !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    if (ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
      if (role !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    return NextResponse.next();
  }

  // /login: authenticated users should not see the login page.
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     *   - _next/static  (Next.js build output)
     *   - _next/image   (image optimisation)
     *   - favicon.ico
     *   - /api/*        (proxy route — auth handled server-side)
     *   - Static image extensions
     */
    "/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
