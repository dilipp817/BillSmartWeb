import { OrderType } from "@/constants";

import type { BillDto } from "../../billing/types";
import type { PrintJobRequest, PrintReceiptItem } from "../types";

// ─── Context passed in from the caller ───────────────────────────────────────

/**
 * Extra context not available on BillDto alone.
 * The bill endpoint does not return order_type, table_number, or cashier_name —
 * those come from the OrderDto and the logged-in user respectively.
 */
export interface ReceiptContext {
  order_type: OrderType;
  /** Present only for DINE_IN orders where a table is assigned. */
  table_number?: string | null;
  /** Username of the logged-in staff member recording the payment. */
  cashier_name?: string;
  /** Restaurant address for the receipt footer (optional — from restaurant settings). */
  restaurant_address?: string;
}

// ─── Formatter ────────────────────────────────────────────────────────────────

/**
 * formatReceipt — pure function that maps a BillDto + ReceiptContext to a
 * PrintJobRequest ready to send to the Print Agent (P-01).
 *
 * Rules:
 * - cgst / sgst are read directly from BillDto — never recomputed
 * - discount is read directly from BillDto.discount_amount — never recomputed
 * - total_amount is read directly from BillDto — never recomputed
 * - item totals use BillItemDto.item_total (not `subtotal` — field names differ)
 * - printed_at is always the current ISO timestamp (generated at call time)
 * - table_number only included for DINE_IN with a non-null table_number
 */
export function formatReceipt(bill: BillDto, context: ReceiptContext): PrintJobRequest {
  const items: PrintReceiptItem[] = bill.bill_items.map((item) => ({
    name: item.food_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: item.item_total,
  }));

  const tableNumber =
    context.order_type === OrderType.DINE_IN && context.table_number
      ? context.table_number
      : undefined;

  return {
    receipt_number: bill.bill_number,
    printed_at: new Date().toISOString(),
    restaurant_name: bill.restaurant_name,
    restaurant_address: context.restaurant_address ?? undefined,
    order_type: context.order_type,
    table_number: tableNumber,
    cashier_name: context.cashier_name ?? undefined,
    items,
    subtotal: bill.subtotal,
    cgst: bill.cgst_amount,
    sgst: bill.sgst_amount,
    discount: bill.discount_amount,
    total: bill.total_amount,
  };
}
