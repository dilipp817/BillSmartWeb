import type { OrderType } from "@/constants";

// ─── Print Receipt Item ───────────────────────────────────────────────────────

/** A single line item as it appears on a printed receipt. */
export interface PrintReceiptItem {
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// ─── Print Job Request ────────────────────────────────────────────────────────

/**
 * The full payload sent to POST /print on the Print Agent.
 *
 * Produced by the Receipt Formatter (P-02). The Print Agent converts this into
 * ESC/POS bytes and sends them to the connected thermal printer.
 *
 * Note: cgst and sgst are always 9% each — never computed client-side (read from BillDto).
 */
export interface PrintJobRequest {
  /** e.g. "BILL-20260421-001" */
  receipt_number: string;
  /** ISO 8601 timestamp */
  printed_at: string;
  restaurant_name: string;
  restaurant_address?: string;
  order_type: OrderType;
  /** Present only for DINE_IN orders */
  table_number?: string;
  cashier_name?: string;
  items: PrintReceiptItem[];
  subtotal: number;
  /** 9% of subtotal — read from BillDto.cgst_amount */
  cgst: number;
  /** 9% of subtotal — read from BillDto.sgst_amount */
  sgst: number;
  /** 0 when no discount applied */
  discount: number;
  total: number;
}

// ─── Print Job Response ───────────────────────────────────────────────────────

/** Response from POST /print on the Print Agent. */
export interface PrintJobResponse {
  success: boolean;
  message: string;
  /** Opaque job identifier — may be used for status polling in Phase 2. */
  job_id?: string;
}

// ─── Health Check ─────────────────────────────────────────────────────────────

/** Response from GET /health on the Print Agent. */
export interface PrintAgentHealthResponse {
  status: "ok" | "error";
  printer_connected: boolean;
  message?: string;
}
