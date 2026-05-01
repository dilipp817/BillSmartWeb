"use client";

import { AlertCircle, CheckCircle2, Loader2, RotateCcw, Wifi } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PRINT_AGENT_DEFAULT_URL } from "@/constants";

import { usePrinterSettingsForm } from "../hooks/use-printer-settings-form";

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PrinterSettingsForm — configure the Print Agent URL for this device.
 *
 * JSX only — all state and logic lives in usePrinterSettingsForm().
 * Feature flag gating is handled by the parent SettingsPage.
 *
 * This is a per-device setting — it is not tied to the user session.
 */
export function PrinterSettingsForm() {
  const {
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
  } = usePrinterSettingsForm();

  return (
    <div className="space-y-4">
      {/* URL field */}
      <div className="space-y-1.5">
        <Label htmlFor="agent-url">Print Agent URL</Label>
        <Input
          id="agent-url"
          type="url"
          value={inputUrl}
          onChange={(e) => handleInputChange(e.target.value)}
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
