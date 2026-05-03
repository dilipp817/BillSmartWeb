import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Content Security Policy.
 *
 * 'unsafe-eval' and 'unsafe-inline' are permitted in development only —
 * Next.js HMR and React Query Devtools require them. Production is strict.
 *
 * connect-src includes the Next.js API proxy origin only (/api/*) — the real
 * backend URL is server-side and never reaches the browser.
 */
const cspDirectives = [
  "default-src 'self'",
  isDev ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'" : "script-src 'self'",
  // Next.js injects inline styles; Google Fonts used for Geist typeface
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  // data: for base64 image placeholders; blob: for print preview
  "img-src 'self' data: blob:",
  // All XHR/fetch goes to same origin via /api/* proxy
  "connect-src 'self'",
  // Service worker is served from the same origin
  "worker-src 'self'",
  "frame-src 'none'",
  // Blocks the page from being embedded in an iframe on any origin
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspDirectives,
  },
  {
    // Blocks the page from being loaded in a frame — defence-in-depth with CSP frame-ancestors
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    // Prevents MIME-type sniffing
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    // HSTS — 1 year, include subdomains, allow preload list submission
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    // Disable browser features not needed by a POS app
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  turbopack: {},
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // Disable service worker in development to avoid HMR conflicts
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist(nextConfig);
