import Image from "next/image";

import { Flame, Leaf, Minus, Plus, Utensils } from "lucide-react";

import { formatCurrency } from "@/utils/currency";
import { cn } from "@/lib/utils";

import type { FoodListItem } from "../types";

interface FoodCardProps {
  food: FoodListItem;
  /** Called when the + button is pressed */
  onAdd: (food: FoodListItem) => void;
  /** Called when the − button is pressed (quantity goes to 0 → item removed) */
  onRemove: (food: FoodListItem) => void;
  /** Quantity currently in cart; undefined / 0 = not in cart */
  quantity?: number;
  className?: string;
}

export function FoodCard({ food, onAdd, onRemove, quantity, className }: FoodCardProps) {
  const inCart = quantity !== undefined && quantity > 0;

  return (
    <div
      className={cn(
        "bg-card text-card-foreground flex cursor-pointer flex-col overflow-hidden rounded-xl ring-1 transition-all select-none",
        food.is_available ? "hover:ring-primary/40" : "cursor-default opacity-50",
        inCart ? "ring-primary/60 ring-2" : "ring-foreground/10",
        className
      )}
      onClick={() => food.is_available && onAdd(food)}
      role="button"
      tabIndex={food.is_available ? 0 : -1}
      aria-disabled={!food.is_available}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && food.is_available) {
          e.preventDefault();
          onAdd(food);
        }
      }}
      aria-label={`Add ${food.name} to cart`}
    >
      {/* Thumbnail */}
      <div className="bg-muted relative h-28 w-full shrink-0 overflow-hidden">
        {food.image_url ? (
          <Image
            src={food.image_url}
            alt={food.name}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Utensils className="text-muted-foreground/40 size-8" />
          </div>
        )}
      </div>

      {/* Name + diet badges */}
      <div className="flex items-start justify-between gap-1 p-3 pb-0">
        <div className="min-w-0">
          <p className="text-sm leading-snug font-medium">{food.name}</p>
          {food.category_name && (
            <p className="text-muted-foreground mt-0.5 truncate text-xs">{food.category_name}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 pt-0.5">
          {food.is_vegetarian === true && (
            <Leaf className="size-3.5 text-green-600" aria-label="Vegetarian" />
          )}
          {food.is_vegetarian === false && (
            <span
              className="inline-block size-2.5 rounded-sm bg-red-600"
              aria-label="Non-vegetarian"
            />
          )}
          {food.is_spicy && <Flame className="size-3.5 text-orange-500" aria-label="Spicy" />}
        </div>
      </div>

      {/* Price + quantity controls */}
      <div className="flex flex-1 flex-col p-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">{formatCurrency(food.price)}</span>

          {inCart ? (
            // ── Inline − qty + controls when item is in cart ──────────────
            <div
              className="bg-primary flex items-center gap-1 rounded-full px-1 py-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(food);
                }}
                className="text-primary-foreground hover:bg-primary-foreground/20 flex size-6 items-center justify-center rounded-full transition-colors"
                aria-label={`Decrease ${food.name}`}
              >
                <Minus className="size-3" />
              </button>
              <span className="text-primary-foreground w-5 text-center text-xs font-bold tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(food);
                }}
                className="text-primary-foreground hover:bg-primary-foreground/20 flex size-6 items-center justify-center rounded-full transition-colors"
                aria-label={`Increase ${food.name}`}
              >
                <Plus className="size-3" />
              </button>
            </div>
          ) : (
            // ── Plain + button when not in cart ───────────────────────────
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (food.is_available) onAdd(food);
              }}
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
          )}
        </div>

        {/* Unavailable label */}
        {!food.is_available && (
          <p className="text-destructive mt-1 text-xs font-medium">Unavailable</p>
        )}
      </div>
    </div>
  );
}
