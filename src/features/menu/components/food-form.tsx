"use client";

import Link from "next/link";

import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { UseFoodFormResult } from "../hooks/use-food-form";

interface FoodFormProps {
  vm: UseFoodFormResult;
  /** Page title shown in the header */
  title: string;
}

/**
 * FoodForm — Zod-validated form for Add and Edit food (M-05).
 *
 * Receives the ViewModel from the page so this component contains only JSX.
 * In "edit" mode the submit button is disabled because the backend has no
 * update endpoint yet (see UpdateFoodRequest note in types/index.ts).
 */
export function FoodForm({ vm, title }: FoodFormProps) {
  const {
    form,
    categories,
    isCategoriesLoading,
    isLoadingFood,
    isSubmitting,
    submitError,
    isEditDisabled,
    onSubmit,
  } = vm;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const isVegetarian = watch("is_vegetarian");
  const isSpicy = watch("is_spicy");

  if (isLoadingFood) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="text-muted-foreground size-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/menu">
          <Button variant="ghost" size="icon" aria-label="Back to menu">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

      {/* Edit-mode notice */}
      {isEditDisabled && (
        <div className="bg-muted rounded-lg p-3 text-sm">
          Editing is not available yet — the backend update endpoint is pending. You can view and
          delete items from the{" "}
          <Link href="/menu" className="text-primary underline underline-offset-4">
            Menu
          </Link>{" "}
          screen.
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Server error */}
        {submitError && (
          <div role="alert" className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
            {submitError}
          </div>
        )}

        {/* Name */}
        <div className="space-y-1.5">
          <Label htmlFor="name">
            Name <span aria-hidden="true">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="e.g. Butter Chicken"
            disabled={isSubmitting || isEditDisabled}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p id="name-error" className="text-destructive text-xs">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="space-y-1.5">
          <Label htmlFor="price">
            Price (₹) <span aria-hidden="true">*</span>
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="e.g. 350.00"
            disabled={isSubmitting || isEditDisabled}
            aria-invalid={!!errors.price}
            aria-describedby={errors.price ? "price-error" : undefined}
            {...register("price")}
          />
          {errors.price && (
            <p id="price-error" className="text-destructive text-xs">
              {errors.price.message}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label htmlFor="category_id">
            Category <span aria-hidden="true">*</span>
          </Label>
          <select
            id="category_id"
            disabled={isSubmitting || isEditDisabled || isCategoriesLoading}
            aria-invalid={!!errors.category_id}
            aria-describedby={errors.category_id ? "category-error" : undefined}
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50"
            {...register("category_id")}
          >
            <option value="">
              {isCategoriesLoading ? "Loading categories…" : "Select a category"}
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category_id && (
            <p id="category-error" className="text-destructive text-xs">
              {errors.category_id.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={3}
            placeholder="Short description (optional)"
            disabled={isSubmitting || isEditDisabled}
            className="border-input bg-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50"
            {...register("description")}
          />
        </div>

        {/* Image URL */}
        <div className="space-y-1.5">
          <Label htmlFor="image_url">Image URL</Label>
          <Input
            id="image_url"
            type="url"
            placeholder="https://… (optional)"
            disabled={isSubmitting || isEditDisabled}
            aria-invalid={!!errors.image_url}
            aria-describedby={errors.image_url ? "image-url-error" : undefined}
            {...register("image_url")}
          />
          {errors.image_url && (
            <p id="image-url-error" className="text-destructive text-xs">
              {errors.image_url.message}
            </p>
          )}
        </div>

        {/* Flags */}
        <div className="flex gap-6">
          {/* Vegetarian */}
          <label className="flex cursor-pointer items-center gap-2 text-sm select-none">
            <input
              type="checkbox"
              className="size-4 accent-green-600"
              checked={isVegetarian}
              disabled={isSubmitting || isEditDisabled}
              onChange={(e) => setValue("is_vegetarian", e.target.checked)}
            />
            Vegetarian
          </label>

          {/* Spicy */}
          <label className="flex cursor-pointer items-center gap-2 text-sm select-none">
            <input
              type="checkbox"
              className="size-4 accent-orange-500"
              checked={isSpicy}
              disabled={isSubmitting || isEditDisabled}
              onChange={(e) => setValue("is_spicy", e.target.checked)}
            />
            Spicy
          </label>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting || isEditDisabled} className="min-w-24">
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save"
            )}
          </Button>
          <Link href="/menu">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
