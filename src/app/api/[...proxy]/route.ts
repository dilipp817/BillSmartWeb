import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { AUTH_LOGIN_PATH, TOKEN_COOKIE, TOKEN_LIFETIME_SECONDS } from "@/constants";
import { env } from "@/env";

export { TOKEN_COOKIE };

type RouteContext = { params: Promise<{ proxy: string[] }> };

async function handler(request: NextRequest, context: RouteContext) {
  const { proxy } = await context.params;
  const path = `/api/${proxy.join("/")}`;

  const targetUrl = new URL(path, env.API_BASE_URL);
  request.nextUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  const forwardHeaders = new Headers();
  forwardHeaders.set("Content-Type", "application/json");

  // Attach JWT from httpOnly cookie for every request except login
  if (path !== AUTH_LOGIN_PATH) {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE)?.value;
    if (token) {
      forwardHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  let body: string | undefined;
  if (request.method !== "GET" && request.method !== "HEAD") {
    body = await request.text();
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: forwardHeaders,
      body,
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Could not reach the server. Please try again.",
          details: null,
        },
      },
      { status: 503 }
    );
  }

  let responseData: unknown;
  const contentType = backendResponse.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    responseData = await backendResponse.json();
  } else {
    const text = await backendResponse.text();
    responseData = {
      success: false,
      error: { code: "UPSTREAM_ERROR", message: text, details: null },
    };
  }

  // Login — extract token, set httpOnly cookie, strip token from response body
  if (path === AUTH_LOGIN_PATH && backendResponse.ok && isSuccessWithToken(responseData)) {
    const { token, ...safeData } = responseData.data;
    const safeResponse = { ...responseData, data: safeData };

    const response = NextResponse.json(safeResponse, {
      status: backendResponse.status,
    });

    response.cookies.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: TOKEN_LIFETIME_SECONDS,
    });

    return response;
  }

  return NextResponse.json(responseData, { status: backendResponse.status });
}

// Narrow unknown response to a shape that has data.token
function isSuccessWithToken(value: unknown): value is {
  success: true;
  data: { token: string } & Record<string, unknown>;
} {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (v.success !== true) return false;
  if (typeof v.data !== "object" || v.data === null) return false;
  const d = v.data as Record<string, unknown>;
  return typeof d.token === "string";
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
