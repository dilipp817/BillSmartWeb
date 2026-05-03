import Image from "next/image";

import { CheckCircle2, Flame, Leaf, Plus, Utensils } from "lucide-react";

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
        "bg-card text-card-foreground flex flex-col overflow-hidden rounded-xl ring-1 transition-all",
        inCart ? "ring-primary/60 ring-2" : "ring-foreground/10",
        !food.is_available && "opacity-50",
        className
      )}
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
        {inCart && (
          <span className="bg-primary text-primary-foreground absolute top-2 right-2 flex size-5 items-center justify-center rounded-full text-[10px] font-bold shadow">
            {quantity}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-3">
        {/* Name + badges */}
        <div className="flex items-start justify-between gap-1">
          <p className="text-sm leading-snug font-medium">{food.name}</p>
          <div className="flex shrink-0 items-center gap-1 pt-0.5">
            {inCart && <CheckCircle2 className="text-primary size-3.5" aria-label="In cart" />}
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

        {/* Price + add button */}
        <div className="mt-2 flex items-center justify-between">
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
    </div>
  );
}
