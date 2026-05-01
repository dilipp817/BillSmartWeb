import Link from "next/link";

import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { UseCategoryFormResult } from "../hooks/use-category-form";

interface CategoryFormProps {
  vm: UseCategoryFormResult;
  /** Page title shown in the header */
  title: string;
}

/**
 * CategoryForm — Zod-validated form for Add and Edit category (M-06).
 *
 * Receives the ViewModel from the page so this component contains only JSX.
 * Both add and edit modes are fully functional (PUT endpoint exists for categories).
 */
export function CategoryForm({ vm, title }: CategoryFormProps) {
  const { form, isLoadingCategory, isSubmitting, submitError, onSubmit } = vm;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  if (isLoadingCategory) {
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
        <Link href="/categories">
          <Button variant="ghost" size="icon" aria-label="Back to categories">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>

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
            placeholder="e.g. Main Course"
            disabled={isSubmitting}
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

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={3}
            placeholder="Short description (optional)"
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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

        {/* Display Order */}
        <div className="space-y-1.5">
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            disabled={isSubmitting}
            aria-invalid={!!errors.display_order}
            aria-describedby={errors.display_order ? "display-order-error" : undefined}
            {...register("display_order")}
          />
          <p className="text-muted-foreground text-xs">Lower numbers appear first. Default is 0.</p>
          {errors.display_order && (
            <p id="display-order-error" className="text-destructive text-xs">
              {errors.display_order.message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save Category"
            )}
          </Button>
          <Link href="/categories">
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
