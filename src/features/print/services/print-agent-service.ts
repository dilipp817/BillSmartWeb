import { PRINT_AGENT_TIMEOUT_MS } from "@/constants";

import type { PrintAgentHealthResponse, PrintJobRequest, PrintJobResponse } from "../types";

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Executes a fetch request to the Print Agent with a hard timeout.
 *
 * The Print Agent runs on localhost — calls go directly from the browser, NOT
 * through the Next.js /api proxy. No auth headers are needed or sent.
 *
 * Throws with a user-facing message on:
 *   - Network error (agent not running / unreachable)
 *   - Timeout (agent too slow)
 *   - Non-2xx HTTP response (agent returned an error)
 */
async function agentFetch<T>(agentUrl: string, path: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), PRINT_AGENT_TIMEOUT_MS);

  try {
    const res = await fetch(`${agentUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

    if (!res.ok) {
      let message = `Print Agent returned ${res.status}.`;
      try {
        const body = (await res.json()) as { message?: string };
        if (body.message) message = body.message;
      } catch {
        // ignore parse error — use status-based message above
      }
      throw new Error(message);
    }

    return (await res.json()) as T;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Print Agent did not respond in time. Check the agent is running.");
      }
      // Re-throw with original message — may include our error from !res.ok above
      throw error;
    }
    throw new Error("Print Agent unreachable. Verify the agent is running and the URL is correct.");
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Print Agent Service ──────────────────────────────────────────────────────

/**
 * Send a print job to the Print Agent.
 *
 * @param agentUrl - The base URL of the Print Agent (e.g. "http://localhost:6868").
 *                   Read from the printer settings configured in P-04.
 * @param job      - The formatted receipt payload produced by the Receipt Formatter (P-02).
 * @returns        PrintJobResponse with success flag and message.
 *
 * @throws Error with a user-facing message on network failure, timeout, or agent error.
 */
export async function printReceipt(
  agentUrl: string,
  job: PrintJobRequest
): Promise<PrintJobResponse> {
  return agentFetch<PrintJobResponse>(agentUrl, "/print", {
    method: "POST",
    body: JSON.stringify(job),
  });
}

/**
 * Check whether the Print Agent is reachable and has a printer connected.
 *
 * Useful for the Printer Settings screen (P-04) to validate the URL before saving.
 *
 * @param agentUrl - The base URL of the Print Agent.
 * @returns        PrintAgentHealthResponse with status and printer_connected.
 *
 * @throws Error with a user-facing message on network failure or timeout.
 */
export async function checkPrintAgentHealth(agentUrl: string): Promise<PrintAgentHealthResponse> {
  return agentFetch<PrintAgentHealthResponse>(agentUrl, "/health", {
    method: "GET",
  });
}
