import Link from "next/link";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/currency";

import type { FoodListItem } from "../types";

interface MenuFoodRowProps {
  food: FoodListItem;
  onDelete: (food: FoodListItem) => void;
  isDeleting: boolean;
}

export function MenuFoodRow({ food, onDelete, isDeleting }: MenuFoodRowProps) {
  return (
    <tr className="hover:bg-muted/50 border-b transition-colors last:border-0">
      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{food.name}</span>
          {food.is_vegetarian && (
            <span className="rounded border border-green-600 px-1 py-0.5 text-[10px] font-semibold text-green-700">
              VEG
            </span>
          )}
          {food.is_spicy && (
            <span className="rounded border border-orange-500 px-1 py-0.5 text-[10px] font-semibold text-orange-600">
              SPICY
            </span>
          )}
        </div>
      </td>

      {/* Category */}
      <td className="text-muted-foreground px-4 py-3 text-sm">{food.category_name}</td>

      {/* Price */}
      <td className="px-4 py-3 text-sm font-medium">{formatCurrency(food.price)}</td>

      {/* Availability */}
      <td className="px-4 py-3">
        <span
          className={
            food.is_available
              ? "inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
              : "inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
          }
        >
          {food.is_available ? "Available" : "Unavailable"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Link href={`/menu/${food.id}/edit`}>
            <Button variant="ghost" size="icon-sm" aria-label={`Edit ${food.name}`}>
              <Pencil className="size-3.5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${food.name}`}
            onClick={() => onDelete(food)}
            disabled={isDeleting}
          >
            <Trash2 className="text-destructive size-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
