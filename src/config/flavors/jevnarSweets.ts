import { Flavor } from "@/constants";

import type { FlavorConfig } from ".";

export const jevnarSweetsConfig: FlavorConfig = {
  id: Flavor.JEVNAR_SWEETS,
  displayName: "Jevnar Sweets",
  appName: "Jevnar Sweets POS",
  // TODO: replace with "/logos/jevnar.svg" once logo asset is ready
  logoPath: null,
  theme: {
    // TODO: replace with Jevnar Sweets brand colors once design team provides them
    primary: "oklch(0.205 0 0)",
    primaryForeground: "oklch(0.985 0 0)",
    sidebarPrimary: "oklch(0.205 0 0)",
    sidebarPrimaryForeground: "oklch(0.985 0 0)",
  },
};
