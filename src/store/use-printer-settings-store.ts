"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { PRINT_AGENT_DEFAULT_URL, PRINTER_SETTINGS_STORAGE_KEY } from "@/constants";

// ─── State & Actions ──────────────────────────────────────────────────────────

interface PrinterSettingsState {
  /**
   * The base URL of the Print Agent running on this machine.
   * Defaults to PRINT_AGENT_DEFAULT_URL (http://localhost:6868).
   * Per-device setting — persisted in localStorage, not tied to the user session.
   */
  agentUrl: string;
}

interface PrinterSettingsActions {
  setAgentUrl: (url: string) => void;
  resetAgentUrl: () => void;
}

type PrinterSettingsStore = PrinterSettingsState & PrinterSettingsActions;

// ─── Store ────────────────────────────────────────────────────────────────────

/**
 * usePrinterSettingsStore — persists the Print Agent URL to localStorage.
 *
 * This is a per-device/per-browser setting — not tied to the user session.
 * It survives logout and is shared across all users on the same browser/device.
 *
 * Use the `useFeatureFlag("is_bill_printing_enabled")` hook to guard access —
 * reading this store directly in components is discouraged.
 */
export const usePrinterSettingsStore = create<PrinterSettingsStore>()(
  persist(
    (set) => ({
      // ── Initial state ────────────────────────────────────────────────────
      agentUrl: PRINT_AGENT_DEFAULT_URL,

      // ── Actions ──────────────────────────────────────────────────────────
      setAgentUrl: (url) => set({ agentUrl: url }),
      resetAgentUrl: () => set({ agentUrl: PRINT_AGENT_DEFAULT_URL }),
    }),
    {
      name: PRINTER_SETTINGS_STORAGE_KEY,
    }
  )
);
