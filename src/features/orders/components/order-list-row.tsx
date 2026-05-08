import { useRouter } from "next/navigation";

import { OrderType } from "@/constants";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";

import type { OrderDto } from "../types";
import { OrderStatusBadge } from "./order-status-badge";

interface OrderListRowProps {
  order: OrderDto;
}

export function OrderListRow({ order }: OrderListRowProps) {
  const router = useRouter();
  const tableLabel =
    order.order_type === OrderType.DINE_IN && order.table_number ? order.table_number : "Takeaway";

  return (
    <tr
      className="hover:bg-muted/50 cursor-pointer border-b transition-colors last:border-0"
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/orders/${order.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(`/orders/${order.id}`);
        }
      }}
    >
      <td className="px-4 py-3 font-mono text-sm font-medium">{order.order_number}</td>
      <td className="px-4 py-3 text-sm">{tableLabel}</td>
      <td className="px-4 py-3 text-sm">{order.items.length}</td>
      <td className="px-4 py-3 text-sm font-medium">{formatCurrency(order.total_amount)}</td>
      <td className="px-4 py-3">
        <OrderStatusBadge status={order.status} />
      </td>
      <td className="text-muted-foreground px-4 py-3 text-sm">{formatDate(order.created_at)}</td>
    </tr>
  );
}
