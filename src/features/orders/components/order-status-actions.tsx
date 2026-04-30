"use client";

import { AlertCircle, Loader2 } from "lucide-react";

import { OrderStatus } from "@/constants";
import { Button } from "@/components/ui/button";

import { useUpdateOrderStatus } from "../hooks/use-update-order-status";

// ─── Transition map ───────────────────────────────────────────────────────────

interface Transition {
  label: string;
  target: OrderStatus;
  variant: "default" | "outline";
}

/**
 * Valid forward/hold transitions per status.
 * CANCELLED and DELIVERED are terminal — no actions shown.
 */
const STATUS_TRANSITIONS: Partial<Record<OrderStatus, Transition[]>> = {
  [OrderStatus.PENDING]: [
    { label: "Start Order", target: OrderStatus.IN_PROGRESS, variant: "default" },
    { label: "Hold", target: OrderStatus.HOLD, variant: "outline" },
  ],
  [OrderStatus.IN_PROGRESS]: [
    { label: "Mark Complete", target: OrderStatus.COMPLETED, variant: "default" },
    { label: "Hold", target: OrderStatus.HOLD, variant: "outline" },
  ],
  [OrderStatus.COMPLETED]: [
    { label: "Mark Delivered", target: OrderStatus.DELIVERED, variant: "default" },
  ],
  [OrderStatus.HOLD]: [{ label: "Resume", target: OrderStatus.IN_PROGRESS, variant: "default" }],
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface OrderStatusActionsProps {
  orderId: number;
  currentStatus: OrderStatus;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * OrderStatusActions — renders contextual status-transition buttons.
 *
 * Renders nothing for terminal statuses (DELIVERED, CANCELLED).
 * All buttons are disabled while a mutation is in-flight.
 */
export function OrderStatusActions({ orderId, currentStatus }: OrderStatusActionsProps) {
  const { updateStatus, isPending, isError, errorMessage } = useUpdateOrderStatus(orderId);

  const transitions = STATUS_TRANSITIONS[currentStatus];

  // Terminal status or no valid forward transition
  if (!transitions || transitions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {transitions.map((t) => (
          <Button
            key={t.target}
            variant={t.variant}
            size="sm"
            onClick={() => updateStatus(t.target)}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {t.label}
          </Button>
        ))}
      </div>

      {isError && (
        <p className="text-destructive flex items-center gap-1.5 text-xs">
          <AlertCircle className="size-3.5 shrink-0" />
          {errorMessage}
        </p>
      )}
    </div>
  );
}
