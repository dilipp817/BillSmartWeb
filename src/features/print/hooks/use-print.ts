import { useMutation } from "@tanstack/react-query";

import { PRINT_AGENT_DEFAULT_URL } from "@/constants";

import { formatReceipt, type ReceiptContext } from "../utils/format-receipt";
import { printReceipt } from "../services/print-agent-service";
import type { BillDto } from "../../billing/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UsePrintResult {
  /** Fire the print mutation. */
  print: () => void;
  isPending: boolean;
  isError: boolean;
  isSuccess: boolean;
  /** Human-readable error for inline display. Never empty when isError is true. */
  errorMessage: string;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * usePrint — mutation hook for sending a receipt to the Print Agent (P-01).
 *
 * Calls formatReceipt (P-02) to build the PrintJobRequest, then calls
 * printReceipt() to POST it to the Print Agent running on localhost.
 *
 * The agent URL defaults to PRINT_AGENT_DEFAULT_URL (localhost:6868).
 * P-04 (Printer Settings) will let operators override this — pass the
 * configured URL via the optional `agentUrl` parameter once P-04 is built.
 *
 * ⚠️ This mutation is best-effort from a financial perspective — the bill has
 *    already been paid before print is triggered. A print failure shows an
 *    inline error but does NOT affect the payment record.
 */
export function usePrint(
  bill: BillDto,
  context: ReceiptContext,
  agentUrl: string = PRINT_AGENT_DEFAULT_URL
): UsePrintResult {
  const mutation = useMutation({
    mutationFn: () => {
      const job = formatReceipt(bill, context);
      return printReceipt(agentUrl, job);
    },
  });

  return {
    print: () => mutation.mutate(),
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    errorMessage:
      mutation.error instanceof Error
        ? mutation.error.message
        : "Print failed. Check the Print Agent is running.",
  };
}
