"use client";

import { useState } from "react";
import { z } from "zod";

import { PRINT_AGENT_DEFAULT_URL } from "@/constants";
import { usePrinterSettingsStore } from "@/store/use-printer-settings-store";

import type { PrintAgentHealthResponse } from "../types";
import { usePrinterHealth } from "./use-printer-health";

// ─── Validation ───────────────────────────────────────────────────────────────

const agentUrlSchema = z
  .string()
  .min(1, "URL is required.")
  .url("Must be a valid URL (e.g. http://localhost:6868).");

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UsePrinterSettingsFormResult {
  inputUrl: string;
  validationError: string | null;
  isSaved: boolean;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  health: PrintAgentHealthResponse | undefined;
  errorMessage: string;
  handleInputChange: (value: string) => void;
  handleTest: () => void;
  handleSave: () => void;
  handleReset: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * usePrinterSettingsForm — ViewModel for PrinterSettingsForm (P-04).
 *
 * Owns all state and event handlers so the component contains JSX only.
 *
 * - handleTest  → validates URL, fires GET /health via usePrinterHealth. Does NOT save.
 * - handleSave  → validates URL, persists to localStorage via usePrinterSettingsStore.
 * - handleReset → resets store + local input to PRINT_AGENT_DEFAULT_URL.
 */
export function usePrinterSettingsForm(): UsePrinterSettingsFormResult {
  const { agentUrl: savedUrl, setAgentUrl, resetAgentUrl } = usePrinterSettingsStore();
  const { testConnection, isPending, isError, isSuccess, health, errorMessage } =
    usePrinterHealth();

  const [inputUrl, setInputUrl] = useState(savedUrl);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  function validate(): string | null {
    const result = agentUrlSchema.safeParse(inputUrl.trim());
    if (!result.success) {
      return result.error.issues[0]?.message ?? "Invalid URL.";
    }
    return null;
  }

  function handleInputChange(value: string) {
    setInputUrl(value);
    setValidationError(null);
    setIsSaved(false);
  }

  function handleTest() {
    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setIsSaved(false);
    testConnection(inputUrl.trim());
  }

  function handleSave() {
    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);
    setAgentUrl(inputUrl.trim());
    setIsSaved(true);
  }

  function handleReset() {
    resetAgentUrl();
    setInputUrl(PRINT_AGENT_DEFAULT_URL);
    setValidationError(null);
    setIsSaved(false);
  }

  return {
    inputUrl,
    validationError,
    isSaved,
    isPending,
    isError,
    isSuccess,
    health,
    errorMessage,
    handleInputChange,
    handleTest,
    handleSave,
    handleReset,
  };
}
