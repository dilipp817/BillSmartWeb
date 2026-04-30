import { OrderStatus } from "@/constants";
import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  [OrderStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  [OrderStatus.HOLD]: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  [OrderStatus.COMPLETED]: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  [OrderStatus.DELIVERED]:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Pending",
  [OrderStatus.IN_PROGRESS]: "In Progress",
  [OrderStatus.HOLD]: "Hold",
  [OrderStatus.COMPLETED]: "Completed",
  [OrderStatus.DELIVERED]: "Delivered",
  [OrderStatus.CANCELLED]: "Cancelled",
};

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
