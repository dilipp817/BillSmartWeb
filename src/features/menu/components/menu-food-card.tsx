import Link from "next/link";

import { Flame, Leaf, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/currency";

import type { FoodListItem } from "../types";

interface MenuFoodCardProps {
  food: FoodListItem;
  onDelete: (food: FoodListItem) => void;
  isDeleting: boolean;
}

export function MenuFoodCard({ food, onDelete, isDeleting }: MenuFoodCardProps) {
  return (
    <div className="bg-card text-card-foreground ring-foreground/10 flex flex-col rounded-xl ring-1">
      {/* Clickable body → edit page */}
      <Link href={`/menu/${food.id}/edit`} className="flex flex-col gap-1 p-4 pb-3">
        {/* Name + diet badges */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm leading-snug font-medium">{food.name}</p>
          <div className="flex shrink-0 items-center gap-1 pt-0.5">
            {food.is_vegetarian && (
              <Leaf
                className="size-3.5 text-green-600"
                aria-label="Vegetarian"
                title="Vegetarian"
              />
            )}
            {food.is_spicy && (
              <Flame className="size-3.5 text-orange-500" aria-label="Spicy" title="Spicy" />
            )}
          </div>
        </div>

        {/* Category */}
        <p className="text-muted-foreground text-xs">{food.category_name}</p>

        {/* Price */}
        <p className="mt-1 text-base font-semibold">{formatCurrency(food.price)}</p>

        {/* Status badge */}
        <span
          className={
            food.is_available
              ? "mt-1 inline-flex w-fit items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
              : "mt-1 inline-flex w-fit items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
          }
        >
          {food.is_available ? "Available" : "Unavailable"}
        </span>
      </Link>

      {/* Action bar */}
      <div className="flex items-center gap-1 border-t px-3 py-2">
        <Link href={`/menu/${food.id}/edit`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full gap-1.5">
            <Pencil className="size-3.5" />
            Edit
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
    </div>
  );
}
