import { CheckCircle2, Flame, Leaf, Plus } from "lucide-react";

import { formatCurrency } from "@/utils/currency";
import { cn } from "@/lib/utils";

import type { FoodListItem } from "../types";

interface FoodCardProps {
  food: FoodListItem;
  /** Called when the + button is clicked */
  onAdd: (food: FoodListItem) => void;
  /** Quantity currently in cart; undefined = not in cart */
  quantity?: number;
  className?: string;
}

export function FoodCard({ food, onAdd, quantity, className }: FoodCardProps) {
  const inCart = quantity !== undefined && quantity > 0;

  return (
    <div
      className={cn(
        "bg-card text-card-foreground flex flex-col rounded-xl p-4 ring-1 transition-all",
        inCart ? "ring-primary/60 ring-2" : "ring-foreground/10",
        !food.is_available && "opacity-50",
        className
      )}
    >
      {/* Name + badges */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm leading-snug font-medium">{food.name}</p>
        <div className="flex shrink-0 items-center gap-1">
          {inCart && <CheckCircle2 className="text-primary size-3.5" aria-label="In cart" />}
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
            "relative flex size-8 items-center justify-center rounded-full transition-colors",
            food.is_available
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          )}
          aria-label={`Add ${food.name}`}
        >
          <Plus className="size-4" />
          {inCart && (
            <span className="bg-primary-foreground text-primary absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full text-[9px] font-bold ring-1 ring-current">
              {quantity}
            </span>
          )}
        </button>
      </div>

      {/* Unavailable label */}
      {!food.is_available && (
        <p className="text-destructive mt-1 text-xs font-medium">Unavailable</p>
      )}
    </div>
  );
}
