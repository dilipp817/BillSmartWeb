import type { Flavor } from "@/constants";

export interface FlavorTheme {
  /** oklch value — overrides --primary in globals.css */
  primary: string;
  /** oklch value — overrides --primary-foreground in globals.css */
  primaryForeground: string;
  /** oklch value — overrides --sidebar-primary in globals.css */
  sidebarPrimary: string;
  /** oklch value — overrides --sidebar-primary-foreground in globals.css */
  sidebarPrimaryForeground: string;
}

export interface FlavorConfig {
  id: Flavor;
  /** Short name shown in the sidebar brand slot */
  displayName: string;
  /** Used in <title> tags and the PWA manifest */
  appName: string;
  /**
   * Path to the logo image relative to /public.
   * e.g. "/logos/smartpos.svg"
   * Set to null when no logo is available — the sidebar will fall back to text.
   */
  logoPath: string | null;
  theme: FlavorTheme;
}
