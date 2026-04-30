"use client";

import { AlertCircle, CheckCircle2, Loader2, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import type { BillDto } from "@/features/billing/types";
import { usePrint } from "@/features/print/hooks/use-print";
import type { ReceiptContext } from "@/features/print/utils/format-receipt";

// ─── Props ────────────────────────────────────────────────────────────────────

interface PrintButtonProps {
  bill: BillDto;
  context: ReceiptContext;
  /** Override the Print Agent URL — defaults to PRINT_AGENT_DEFAULT_URL (P-04). */
  agentUrl?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * PrintButton — feature-flagged receipt print trigger.
 *
 * Hidden entirely when is_bill_printing_enabled is false.
 * Disabled while the print request is in-flight (no double-sends).
 * Shows a success confirmation and inline error on failure.
 *
 * Used on:
 *   - Bill detail screen (after bill is generated)
 *   - Payment success screen (after payment is confirmed)
 */
export function PrintButton({ bill, context, agentUrl }: PrintButtonProps) {
  const isPrintingEnabled = useFeatureFlag("is_bill_printing_enabled");

  const { print, isPending, isError, isSuccess, errorMessage } = usePrint(bill, context, agentUrl);

  // Feature flag off → hide entirely
  if (!isPrintingEnabled) return null;

  if (isSuccess) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        <CheckCircle2 className="size-4 shrink-0" />
        <span>Receipt sent to printer.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" className="w-full" size="lg" onClick={print} disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Printing…
          </>
        ) : (
          <>
            <Printer className="mr-2 size-4" />
            Print Receipt
          </>
        )}
      </Button>
      {isError && (
        <p className="text-destructive flex items-center gap-1.5 text-xs">
          <AlertCircle className="size-3 shrink-0" />
          {errorMessage}
        </p>
      )}
    </div>
  );
}
