import { PAYMENT_REF_PREFIX } from "@/constants";

/**
 * Generate a unique payment reference number for idempotency.
 * Format: PAY-{timestamp}-{4-char random hex}
 * Example: "PAY-1746000000000-3f9a"
 *
 * Must be persisted BEFORE the network call so it can be re-used on retry.
 * Never call this inside a retry loop — generate once and store.
 */
export function generatePaymentRef(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .padStart(4, "0");
  return `${PAYMENT_REF_PREFIX}-${timestamp}-${random}`;
}
