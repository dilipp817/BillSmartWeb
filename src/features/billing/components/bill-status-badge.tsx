import { BillStatus } from "@/constants";

// ─── Style maps ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<BillStatus, string> = {
  [BillStatus.ISSUED]: "bg-blue-100 text-blue-700",
  [BillStatus.PARTIAL]: "bg-amber-100 text-amber-700",
  [BillStatus.PAID]: "bg-green-100 text-green-700",
  [BillStatus.CANCELLED]: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<BillStatus, string> = {
  [BillStatus.ISSUED]: "Issued",
  [BillStatus.PARTIAL]: "Partial",
  [BillStatus.PAID]: "Paid",
  [BillStatus.CANCELLED]: "Cancelled",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface BillStatusBadgeProps {
  status: BillStatus;
}

export function BillStatusBadge({ status }: BillStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
