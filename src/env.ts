import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    // Spring Boot backend URL — server-side only, never exposed to the browser.
    // All browser API calls go through Next.js /api/... proxy routes.
    API_BASE_URL: z.url(),
    // Secret used by the Next.js API proxy to authenticate internal requests (optional, for extra hardening).
    API_INTERNAL_SECRET: z.string().min(32).optional(),
    // Build variant — identifies which deploy environment this instance is running as.
    APP_ENV: z.enum(["dev", "uat", "prod"]).default("dev"),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_APP_NAME: z.string().min(1).default("BillSmart"),
    // Client flavor — identifies which business this deployment is for.
    // Drives branding (logo, display name, color theme).
    NEXT_PUBLIC_FLAVOR: z.enum(["smartPos", "jevnarSweets"]).default("smartPos"),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    API_BASE_URL: process.env.API_BASE_URL,
    API_INTERNAL_SECRET: process.env.API_INTERNAL_SECRET,
    APP_ENV: process.env.APP_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_FLAVOR: process.env.NEXT_PUBLIC_FLAVOR,
  },
});
