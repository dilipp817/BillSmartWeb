import { Flavor } from "@/constants";

import type { FlavorConfig } from ".";

export const smartPosConfig: FlavorConfig = {
  id: Flavor.SMART_POS,
  displayName: "BillSmart",
  appName: "BillSmart",
  // TODO: replace with "/logos/smartpos.svg" once logo asset is ready
  logoPath: null,
  theme: {
    primary: "oklch(0.205 0 0)",
    primaryForeground: "oklch(0.985 0 0)",
    sidebarPrimary: "oklch(0.205 0 0)",
    sidebarPrimaryForeground: "oklch(0.985 0 0)",
  },
};
