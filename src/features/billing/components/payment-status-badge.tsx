import { PaymentStatus } from "@/constants";

// ─── Style maps ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "bg-amber-100 text-amber-700",
  [PaymentStatus.SUCCESS]: "bg-green-100 text-green-700",
  [PaymentStatus.FAILED]: "bg-red-100 text-red-700",
  [PaymentStatus.REFUNDED]: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: "Pending",
  [PaymentStatus.SUCCESS]: "Success",
  [PaymentStatus.FAILED]: "Failed",
  [PaymentStatus.REFUNDED]: "Refunded",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
