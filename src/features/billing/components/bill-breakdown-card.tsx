import { BillStatus } from "@/constants";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

import type { BillDto } from "../types";
import { BillStatusBadge } from "./bill-status-badge";

// ─── Component ────────────────────────────────────────────────────────────────

interface BillBreakdownCardProps {
  bill: BillDto;
}

/**
 * BillBreakdownCard — displays a full bill: line items, subtotal, CGST, SGST,
 * optional discount, total, and paid/remaining amounts.
 *
 * ⚠️ All monetary values are read directly from BillDto — never computed here.
 *    paid_amount and remaining_amount are server-computed; do NOT derive them.
 */
export function BillBreakdownCard({ bill }: BillBreakdownCardProps) {
  const hasDiscount = bill.discount_amount > 0;
  const isPartiallyPaid = bill.status === BillStatus.PARTIAL && bill.paid_amount > 0;
  const isPaid = bill.status === BillStatus.PAID;

  return (
    <div className="rounded-xl border">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <p className="text-muted-foreground text-xs">Bill Number</p>
          <p className="font-semibold">{bill.bill_number}</p>
        </div>
        <BillStatusBadge status={bill.status} />
      </div>

      {/* ── Line Items ─────────────────────────────────────────────────────── */}
      <div className="divide-y">
        {bill.bill_items.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-4 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{item.food_name}</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground w-6 text-right">×{item.quantity}</span>
              <span className="text-muted-foreground w-20 text-right">
                {formatCurrency(item.unit_price)}
              </span>
              <span className="w-24 text-right font-medium">{formatCurrency(item.item_total)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Totals ─────────────────────────────────────────────────────────── */}
      <div className="space-y-2 border-t px-4 py-4">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(bill.subtotal)}</span>
        </div>

        {/* Tax split */}
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">CGST (9%)</span>
          <span>{formatCurrency(bill.cgst_amount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">SGST (9%)</span>
          <span>{formatCurrency(bill.sgst_amount)}</span>
        </div>

        {/* Discount — only shown when non-zero */}
        {hasDiscount && (
          <div className="flex justify-between text-sm text-green-700">
            <span>Discount</span>
            <span>− {formatCurrency(bill.discount_amount)}</span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between border-t pt-2 font-semibold">
          <span>Total</span>
          <span>{formatCurrency(bill.total_amount)}</span>
        </div>

        {/* Paid / Remaining — only shown when relevant */}
        {(isPartiallyPaid || isPaid) && (
          <div className="flex justify-between text-sm text-green-700">
            <span>Paid</span>
            <span>{formatCurrency(bill.paid_amount)}</span>
          </div>
        )}
        {isPartiallyPaid && bill.remaining_amount > 0 && (
          <div className="flex justify-between text-sm font-semibold text-amber-700">
            <span>Remaining</span>
            <span>{formatCurrency(bill.remaining_amount)}</span>
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="text-muted-foreground border-t px-4 py-2 text-xs">
        Generated {formatDate(bill.created_at)}
      </div>
    </div>
  );
}
