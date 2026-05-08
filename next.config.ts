import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

/**
 * Security response headers applied to every route.
 *
 * Content-Security-Policy is intentionally absent here — it is set per-request
 * in middleware (src/middleware.ts) with a cryptographic nonce so that Next.js
 * App Router inline scripts (RSC payloads, hydration) are allowed while
 * arbitrary inline scripts are still blocked.
 */
const securityHeaders = [
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
