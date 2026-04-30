"use client";

import { useFeatureFlagStore, type FeatureFlags } from "@/store/use-feature-flag-store";

/**
 * Read a single feature flag from the Zustand store.
 *
 * Rules:
 * - If the flag is `false`, **hide** the feature entirely — do not just disable it.
 * - Never call the flags API here — that is A-06's job.
 * - Never read the store directly in components — always use this hook.
 *
 * @example
 *   const isPrintEnabled = useFeatureFlag("is_bill_printing_enabled");
 *   if (!isPrintEnabled) return null;
 */
export function useFeatureFlag(flag: keyof FeatureFlags): boolean {
  return useFeatureFlagStore((state) => state.flags[flag]);
}
