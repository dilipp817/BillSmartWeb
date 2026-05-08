"use client";

import { X, Play, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cartRunningTotal, useCartStore, type HeldBill } from "@/store/use-cart-store";
import { formatCurrency } from "@/utils/currency";

interface HeldBillsDialogProps {
  onClose: () => void;
}

export function HeldBillsDialog({ onClose }: HeldBillsDialogProps) {
  const { heldBills, resumeHeldBill, deleteHeldBill } = useCartStore();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden="true" />

      {/* Panel */}
      <div
        role="dialog"
        aria-label="Held Bills"
        className="bg-background fixed top-16 right-4 z-50 w-80 rounded-xl border shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2 font-semibold">
            <List className="size-4" />
            Held Bills
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
              {heldBills.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Bill list */}
        <div className="max-h-80 overflow-y-auto">
          {heldBills.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">No held bills.</p>
          ) : (
            <ul className="divide-y">
              {heldBills.map((bill) => (
                <HeldBillRow
                  key={bill.id}
                  bill={bill}
                  onResume={() => {
                    resumeHeldBill(bill.id);
                    onClose();
                  }}
                  onDelete={() => deleteHeldBill(bill.id)}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

interface HeldBillRowProps {
  bill: HeldBill;
  onResume: () => void;
  onDelete: () => void;
}

function HeldBillRow({ bill, onResume, onDelete }: HeldBillRowProps) {
  const subtotal = cartRunningTotal(bill.items);
  const itemCount = bill.items.reduce((s, i) => s + i.quantity, 0);
  const heldTime = new Date(bill.heldAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">Bill #{bill.id}</p>
        <p className="text-muted-foreground text-xs">
          {itemCount} item{itemCount !== 1 ? "s" : ""} · {formatCurrency(subtotal)} · {heldTime}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <Button size="sm" variant="outline" onClick={onResume} className="h-7 px-2">
          <Play className="size-3.5" />
          <span className="sr-only">Resume Bill #{bill.id}</span>
        </Button>
        <button
          type="button"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive p-1 transition-colors"
          aria-label={`Delete Bill #${bill.id}`}
        >
          <X className="size-3.5" />
        </button>
      </div>
    </li>
  );
}
