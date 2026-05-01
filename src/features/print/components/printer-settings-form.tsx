"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, RotateCcw, Wifi } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PRINT_AGENT_DEFAULT_URL } from "@/constants";
import { useFeatureFlag } from "@/hooks/use-feature-flag";

import { usePrinterHealth } from "../hooks/use-printer-health";
import { usePrinterSettingsStore } from "@/store/use-printer-settings-store";

// ─── Validation ───────────────────────────────────────────────────────────────

const agentUrlSchema = z
  .string()
  .min(1, "URL is required.")
  .url("Must be a valid URL (e.g. http://localhost:6868).");

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PrinterSettingsForm — configure the Print Agent URL for this device.
 *
 * - Validates the URL with Zod before saving or testing.
 * - "Test Connection" hits GET /health on the given URL — does NOT save.
 * - "Save" persists the validated URL to localStorage via usePrinterSettingsStore.
 * - Hidden entirely when is_bill_printing_enabled is false.
 *
 * This is a per-device setting — it is not tied to the user session.
 */
export function PrinterSettingsForm() {
  const isPrintingEnabled = useFeatureFlag("is_bill_printing_enabled");

  const { agentUrl: savedUrl, setAgentUrl, resetAgentUrl } = usePrinterSettingsStore();
  const { testConnection, isPending, isError, isSuccess, health, errorMessage } =
    usePrinterHealth();

  const [inputUrl, setInputUrl] = useState(savedUrl);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  // Feature flag off → hide entirely
  if (!isPrintingEnabled) return null;

  function validate(): string | null {
    const result = agentUrlSchema.safeParse(inputUrl.trim());
    if (!result.success) {
      return result.error.issues[0]?.message ?? "Invalid URL.";
    }
    return null;
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

  return (
    <div className="space-y-4">
      {/* URL field */}
      <div className="space-y-1.5">
        <Label htmlFor="agent-url">Print Agent URL</Label>
        <Input
          id="agent-url"
          type="url"
          value={inputUrl}
          onChange={(e) => {
            setInputUrl(e.target.value);
            setValidationError(null);
            setIsSaved(false);
          }}
          placeholder={PRINT_AGENT_DEFAULT_URL}
          className="font-mono text-sm"
          disabled={isPending}
        />
        {validationError && (
          <p className="text-destructive flex items-center gap-1.5 text-xs">
            <AlertCircle className="size-3 shrink-0" />
            {validationError}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={handleTest} disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Testing…
            </>
          ) : (
            <>
              <Wifi className="mr-2 size-4" />
              Test Connection
            </>
          )}
        </Button>

        <Button onClick={handleSave} disabled={isPending}>
          Save
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleReset}
          disabled={isPending}
          title="Reset to default"
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>

      {/* Test result — success */}
      {isSuccess && health && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="size-4 shrink-0" />
            Agent reachable
          </div>
          <p className="mt-1 text-xs">
            Printer connected:{" "}
            <span className="font-semibold">{health.printer_connected ? "Yes" : "No"}</span>
            {health.message ? ` — ${health.message}` : ""}
          </p>
        </div>
      )}

      {/* Test result — error */}
      {isError && (
        <div className="text-destructive flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Save confirmation */}
      {isSaved && !isError && (
        <p className="flex items-center gap-1.5 text-xs text-green-700">
          <CheckCircle2 className="size-3 shrink-0" />
          Settings saved for this device.
        </p>
      )}
    </div>
  );
}
