"use client";

import Link from "next/link";

import { OrderStatus, OrderType } from "@/constants";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import type { OrderDto } from "@/features/orders/types";

interface OrderHistoryTableProps {
  orders: OrderDto[];
}

const STATUS_COLOURS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "bg-yellow-100 text-yellow-800",
  [OrderStatus.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [OrderStatus.HOLD]: "bg-orange-100 text-orange-800",
  [OrderStatus.COMPLETED]: "bg-green-100 text-green-800",
  [OrderStatus.DELIVERED]: "bg-emerald-100 text-emerald-800",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-800",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Pending",
  [OrderStatus.IN_PROGRESS]: "In Progress",
  [OrderStatus.HOLD]: "Hold",
  [OrderStatus.COMPLETED]: "Completed",
  [OrderStatus.DELIVERED]: "Delivered",
  [OrderStatus.CANCELLED]: "Cancelled",
};

/**
 * OrderHistoryTable — displays the full order log as a scrollable table.
 * Each row links to the order detail screen.
 */
export function OrderHistoryTable({ orders }: OrderHistoryTableProps) {
  if (orders.length === 0) {
    return (
      <div className="text-muted-foreground flex h-32 items-center justify-center text-sm">
        No orders found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Order #</th>
            <th className="px-4 py-3 text-left font-medium">Type</th>
            <th className="px-4 py-3 text-left font-medium">Table</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Items</th>
            <th className="px-4 py-3 text-right font-medium">Total</th>
            <th className="px-4 py-3 text-left font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="hover:bg-muted/30 border-b transition-colors last:border-0"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/orders/${order.id}`}
                  className="text-primary font-medium hover:underline"
                >
                  {order.order_number}
                </Link>
              </td>
              <td className="text-muted-foreground px-4 py-3">
                {order.order_type === OrderType.DINE_IN ? "Dine In" : "Takeaway"}
              </td>
              <td className="text-muted-foreground px-4 py-3">{order.table_number ?? "—"}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOURS[order.status]}`}
                >
                  {STATUS_LABEL[order.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{order.items.length}</td>
              <td className="px-4 py-3 text-right font-medium tabular-nums">
                {formatCurrency(order.total_amount)}
              </td>
              <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                {formatDate(order.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
