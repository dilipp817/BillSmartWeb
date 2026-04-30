"use client";

import { use, useState } from "react";

import { z } from "zod";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

import { PaymentMethod } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/utils/currency";
import { useRecordPayment } from "@/features/billing/hooks/use-record-payment";

// ─── Validation ───────────────────────────────────────────────────────────────

/** Amount must be positive with at most 2 decimal places. */
const amountSchema = z.coerce
  .number()
  .positive("Amount must be greater than 0")
  .refine((v) => Math.round(v * 100) / 100 === v, "Max 2 decimal places");

// ─── Payment method options ───────────────────────────────────────────────────

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: PaymentMethod.CASH, label: "Cash" },
  { value: PaymentMethod.CARD, label: "Card" },
  { value: PaymentMethod.UPI, label: "UPI" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ billId?: string; amount?: string }>;
}

export default function RecordPaymentPage({ params, searchParams }: PageProps) {
  const { id } = use(params);
  const { billId: billIdParam, amount: amountParam } = use(searchParams);

  const orderId = Number(id);
  const billId = billIdParam ? Number(billIdParam) : undefined;

  // Pre-fill from query param (remaining_amount passed from B-04 breakdown)
  const [amountInput, setAmountInput] = useState(amountParam ?? "");
  const [amountError, setAmountError] = useState<string | null>(null);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.CASH);

  const { recordPayment, isPending, isError, errorMessage } = useRecordPayment(orderId, billId);

  // Change amount — only relevant for CASH overpayments
  const parsedAmount = Number(amountInput);
  const prefilledAmount = amountParam ? Number(amountParam) : null;
  const changeAmount =
    selectedMethod === PaymentMethod.CASH &&
    prefilledAmount !== null &&
    parsedAmount > prefilledAmount
      ? Math.round((parsedAmount - prefilledAmount) * 100) / 100
      : 0;

  const handleSubmit = () => {
    setAmountError(null);

    const parsed = amountSchema.safeParse(amountInput);
    if (!parsed.success) {
      setAmountError(parsed.error.issues[0]?.message ?? "Invalid amount");
      return;
    }

    recordPayment({
      amount: parsed.data,
      paymentMethod: selectedMethod,
      changeAmount,
    });
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link href={billId ? `/orders/${orderId}/bill` : `/orders/${orderId}`}>
          <Button variant="ghost" size="icon" aria-label="Go back">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold">Record Payment</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Order #{orderId}</p>
        </div>
      </div>

      {/* ── Payment method selection ─────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Payment Method</p>
        <div className="flex gap-3">
          {PAYMENT_METHODS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedMethod(value)}
              disabled={isPending}
              className={`flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                selectedMethod === value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-muted border-border"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Amount entry ─────────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="amount">
          {selectedMethod === PaymentMethod.CASH ? "Amount Tendered (₹)" : "Amount (₹)"}
        </Label>
        <Input
          id="amount"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={amountInput}
          onChange={(e) => {
            setAmountInput(e.target.value);
            setAmountError(null);
          }}
          disabled={isPending}
        />
        {amountError && (
          <p className="text-destructive flex items-center gap-1.5 text-xs">
            <AlertCircle className="size-3 shrink-0" />
            {amountError}
          </p>
        )}
      </div>

      {/* ── CASH — change amount preview ─────────────────────────────────────── */}
      {selectedMethod === PaymentMethod.CASH && changeAmount > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-amber-50 px-4 py-3 text-sm">
          <span className="font-medium text-amber-800">Change to return</span>
          <span className="font-semibold text-amber-800">{formatCurrency(changeAmount)}</span>
        </div>
      )}

      {/* ── CARD info banner ─────────────────────────────────────────────────── */}
      {selectedMethod === PaymentMethod.CARD && (
        <div className="text-muted-foreground rounded-lg border bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Card payments require terminal confirmation. After clicking Confirm, you will be prompted
          to confirm once the terminal approves.
        </div>
      )}

      {/* ── API error ────────────────────────────────────────────────────────── */}
      {isError && (
        <div className="text-destructive flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm">
          <AlertCircle className="size-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* ── Confirm button — disabled while in-flight (no double submissions) ── */}
      <Button onClick={handleSubmit} disabled={isPending} className="w-full" size="lg">
        {isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Processing…
          </>
        ) : (
          `Confirm ${selectedMethod === PaymentMethod.CASH ? "Cash" : selectedMethod === PaymentMethod.CARD ? "Card" : "UPI"} Payment`
        )}
      </Button>
    </div>
  );
}
