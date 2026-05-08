"use client";

import { use } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  AlertCircle,
  ArrowLeft,
  Clock,
  Flame,
  Leaf,
  Loader2,
  Pencil,
  ShoppingCart,
  Utensils,
  Zap,
} from "lucide-react";

import { UserRole } from "@/constants";
import { RoleGuard } from "@/components/role-guard";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/use-cart-store";
import { formatCurrency } from "@/utils/currency";

import { useFoodDetail } from "@/features/menu/hooks/use-food-detail";
import type { FoodDetail } from "@/features/menu/types";

interface FoodDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function FoodDetailPage({ params }: FoodDetailPageProps) {
  const { id } = use(params);
  const foodId = Number(id);

  const router = useRouter();
  const { food, isLoading, isError } = useFoodDetail(foodId);

  if (isNaN(foodId) || foodId <= 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <AlertCircle className="text-destructive size-8" />
        <p className="text-muted-foreground text-sm">Invalid food ID.</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-muted-foreground size-8 animate-spin" />
      </div>
    );
  }

  if (isError || !food) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <AlertCircle className="text-destructive size-8" />
        <p className="text-muted-foreground text-sm">Could not load food item.</p>
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  return <FoodDetailView food={food} />;
}

function FoodDetailView({ food }: { food: FoodDetail }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (!food.is_available) return;
    addItem({
      id: food.id,
      name: food.name,
      price: food.price,
      image_url: food.image_url,
      category_name: food.category_name,
      is_available: food.is_available,
      is_vegetarian: food.is_vegetarian,
      is_spicy: food.is_spicy,
    });
    router.back();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Back">
          <ArrowLeft className="size-4" />
        </Button>
        <h1 className="text-xl font-semibold">Food Detail</h1>

        {/* Admin-only edit button */}
        <RoleGuard allowedRoles={[UserRole.ADMIN]}>
          <Link href={`/menu/${food.id}/edit`} className="ml-auto">
            <Button variant="outline" size="sm">
              <Pencil className="mr-1.5 size-3.5" />
              Edit
            </Button>
          </Link>
        </RoleGuard>
      </div>

      {/* Image */}
      <div className="bg-muted relative h-56 w-full overflow-hidden rounded-2xl">
        {food.image_url ? (
          <Image
            src={food.image_url}
            alt={food.name}
            fill
            sizes="(max-width: 640px) 100vw, 672px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Utensils className="text-muted-foreground/40 size-12" />
          </div>
        )}
        {!food.is_available && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-red-600">
              Unavailable
            </span>
          </div>
        )}
      </div>

      {/* Title row */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-2xl font-bold">{food.name}</h2>
          <span className="text-2xl font-bold">{formatCurrency(food.price)}</span>
        </div>

        {/* Category + diet badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
            {food.category_name}
          </span>
          {food.is_vegetarian && (
            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              <Leaf className="size-3" />
              Vegetarian
            </span>
          )}
          {food.is_spicy && (
            <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
              <Flame className="size-3" />
              Spicy
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      {food.description && (
        <p className="text-muted-foreground leading-relaxed">{food.description}</p>
      )}

      {/* Meta grid */}
      {(food.preparation_time || food.calories || food.allergens) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {food.preparation_time !== null && (
            <div className="bg-muted flex items-center gap-2 rounded-xl p-3">
              <Clock className="text-muted-foreground size-4 shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Prep time</p>
                <p className="text-sm font-medium">{food.preparation_time} min</p>
              </div>
            </div>
          )}
          {food.calories !== null && (
            <div className="bg-muted flex items-center gap-2 rounded-xl p-3">
              <Zap className="text-muted-foreground size-4 shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Calories</p>
                <p className="text-sm font-medium">{food.calories} kcal</p>
              </div>
            </div>
          )}
          {food.allergens && (
            <div className="bg-muted col-span-2 flex items-center gap-2 rounded-xl p-3 sm:col-span-1">
              <AlertCircle className="text-muted-foreground size-4 shrink-0" />
              <div>
                <p className="text-muted-foreground text-xs">Allergens</p>
                <p className="text-sm font-medium">{food.allergens}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add to Cart */}
      <Button onClick={handleAddToCart} disabled={!food.is_available} className="w-full" size="lg">
        <ShoppingCart className="mr-2 size-4" />
        {food.is_available ? "Add to Cart" : "Unavailable"}
      </Button>
    </div>
  );
}
