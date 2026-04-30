import { Flame, Leaf, Plus } from "lucide-react";

import { formatCurrency } from "@/utils/currency";
import { cn } from "@/lib/utils";

import type { FoodListItem } from "../types";

interface FoodCardProps {
  food: FoodListItem;
  /** Called when the + button is clicked */
  onAdd: (food: FoodListItem) => void;
  className?: string;
}

export function FoodCard({ food, onAdd, className }: FoodCardProps) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground ring-foreground/10 flex flex-col rounded-xl p-4 ring-1",
        !food.is_available && "opacity-50",
        className
      )}
    >
      {/* Name + badges */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm leading-snug font-medium">{food.name}</p>
        <div className="flex shrink-0 items-center gap-1">
          {food.is_vegetarian && (
            <span title="Vegetarian">
              <Leaf className="size-3.5 text-green-600" aria-label="Vegetarian" />
            </span>
          )}
          {food.is_spicy && (
            <span title="Spicy">
              <Flame className="size-3.5 text-orange-500" aria-label="Spicy" />
            </span>
          )}
        </div>
      </div>

      {/* Category */}
      <p className="text-muted-foreground mt-0.5 text-xs">{food.category_name}</p>

      {/* Price + add button */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-base font-semibold">{formatCurrency(food.price)}</span>
        <button
          type="button"
          onClick={() => onAdd(food)}
          disabled={!food.is_available}
          className={cn(
            "flex size-8 items-center justify-center rounded-full transition-colors",
            food.is_available
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
          aria-label={`Add ${food.name}`}
        >
          <Plus className="size-4" />
        </button>
      </div>

      {/* Unavailable label */}
      {!food.is_available && (
        <p className="text-destructive mt-1 text-xs font-medium">Unavailable</p>
      )}
    </div>
  );
}
