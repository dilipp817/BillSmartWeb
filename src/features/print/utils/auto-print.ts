import { generateBill } from "@/features/billing/services/bill-service";

import { formatReceipt, type ReceiptContext } from "./format-receipt";
import { printReceipt } from "../services/print-agent-service";

/**
 * autoGenerateAndPrint — fire-and-forget chain triggered after a successful
 * order creation.
 *
 * Steps:
 *   1. POST /generate-bill (discount=0) → BillDto
 *   2. formatReceipt(bill, context)     → PrintJobRequest
 *   3. POST /print to Print Agent       → sends to thermal printer
 *
 * Always call with `void` — the caller should never await this.
 * Failures are swallowed: the cashier is already taking the next order and
 * the manual reprint flow on the Orders page handles recovery.
 *
 * Only called when is_bill_printing_enabled feature flag is true (enforced
 * by the caller — useCreateOrder).
 */
export async function autoGenerateAndPrint(
  restaurantId: number,
  orderId: number,
  context: ReceiptContext,
  agentUrl: string
): Promise<void> {
  try {
    const bill = await generateBill(restaurantId, orderId, { discount: 0 });
    const job = formatReceipt(bill, context);
    await printReceipt(agentUrl, job);
  } catch {
    // Intentionally silent — print is best-effort after order placement.
    // Cashier can reprint manually from the Orders page if needed.
  }
}
