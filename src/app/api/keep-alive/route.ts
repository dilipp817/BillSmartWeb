import { NextResponse } from "next/server";

import { env } from "@/env";

/**
 * GET /api/keep-alive
 *
 * Pings the backend health endpoint server-side so the backend URL is never
 * exposed to the browser. Called by the useKeepAlive hook every 14 minutes
 * to prevent Render free-tier instances from spinning down after 15 min idle.
 *
 * Returns 200 on success or if the backend is already awake.
 * Returns 503 on network error — client ignores this silently.
 */
export async function GET(): Promise<NextResponse> {
  try {
    await fetch(`${env.API_BASE_URL}/actuator/health`, {
      method: "GET",
      // Short timeout — this is a fire-and-forget ping, not a critical request.
      signal: AbortSignal.timeout(5_000),
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
