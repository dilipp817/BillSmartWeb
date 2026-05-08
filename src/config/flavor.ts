import { Flavor } from "@/constants";

import type { FlavorConfig } from "./flavors";
import { jevnarSweetsConfig } from "./flavors/jevnarSweets";
import { smartPosConfig } from "./flavors/smartPos";

const flavorMap: Record<Flavor, FlavorConfig> = {
  [Flavor.SMART_POS]: smartPosConfig,
  [Flavor.JEVNAR_SWEETS]: jevnarSweetsConfig,
};

/**
 * Resolves the active flavor from NEXT_PUBLIC_FLAVOR.
 * Next.js inlines NEXT_PUBLIC_ vars at build time, so this is effectively
 * a compile-time constant — no runtime overhead.
 * Defaults to smartPos if the variable is missing or unrecognised.
 */
function resolveFlavorId(): Flavor {
  const raw = process.env.NEXT_PUBLIC_FLAVOR;
  if (raw === Flavor.JEVNAR_SWEETS) return Flavor.JEVNAR_SWEETS;
  return Flavor.SMART_POS;
}

/** The active flavor config for this deployment. */
export const currentFlavor: FlavorConfig = flavorMap[resolveFlavorId()];
