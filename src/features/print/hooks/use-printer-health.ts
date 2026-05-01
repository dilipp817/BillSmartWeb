"use client";

import { useMutation } from "@tanstack/react-query";

import { checkPrintAgentHealth } from "../services/print-agent-service";
import type { PrintAgentHealthResponse } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UsePrinterHealthResult {
  /** Fire a health check against the given agent URL. */
  testConnection: (agentUrl: string) => void;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  /** Populated on success — shows printer status details. */
  health: PrintAgentHealthResponse | undefined;
  /** Human-readable error for inline display. Never empty when isError is true. */
  errorMessage: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * usePrinterHealth — mutation hook for testing the Print Agent connection (P-04).
 *
 * Calls GET /health on the given agent URL and reports the result inline.
 * Used by PrinterSettingsForm to validate the URL before saving.
 *
 * ⚠️ This is a test-only action — it does NOT save the URL.
 *    Saving is done separately via usePrinterSettingsStore.setAgentUrl().
 */
export function usePrinterHealth(): UsePrinterHealthResult {
  const mutation = useMutation({
    mutationFn: (agentUrl: string) => checkPrintAgentHealth(agentUrl),
  });

  return {
    testConnection: (agentUrl: string) => mutation.mutate(agentUrl),
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    health: mutation.data,
    errorMessage:
      mutation.error instanceof Error
        ? mutation.error.message
        : "Could not reach the Print Agent. Check the URL and ensure the agent is running.",
  };
}
