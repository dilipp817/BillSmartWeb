"use client";

import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useRestaurantSettings } from "../hooks/use-restaurant-settings";

/**
 * RestaurantSettingsForm — Zod-validated form to view and update restaurant
 * details (S-03). Admin only.
 *
 * Loads current restaurant data from GET /restaurants/{id} and pre-fills all
 * fields. On submit sends PATCH /restaurants/{id} with all required fields.
 *
 * Layer: Component (JSX only — all state and logic via useRestaurantSettings)
 */
export function RestaurantSettingsForm() {
  const { form, isLoading, isSubmitting, isSuccess, submitError, onSubmit } =
    useRestaurantSettings();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-4">
        <Loader2 className="text-muted-foreground size-4 animate-spin" />
        <span className="text-muted-foreground text-sm">Loading settings…</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {/* Server error */}
      {submitError && (
        <div role="alert" className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
          {submitError}
        </div>
      )}

      {/* Success banner */}
      {isSuccess && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700"
        >
          <CheckCircle2 className="size-4 shrink-0" />
          Settings saved successfully.
        </div>
      )}

      {/* ── Restaurant identity ─────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <Label htmlFor="outlet_name">
          Outlet Name <span aria-hidden="true">*</span>
        </Label>
        <Input
          id="outlet_name"
          type="text"
          disabled={isSubmitting}
          aria-invalid={!!errors.outlet_name}
          aria-describedby={errors.outlet_name ? "outlet-name-error" : undefined}
          {...register("outlet_name")}
        />
        {errors.outlet_name && (
          <p id="outlet-name-error" className="text-destructive text-xs">
            {errors.outlet_name.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="displayname">
          Display Name <span aria-hidden="true">*</span>
        </Label>
        <Input
          id="displayname"
          type="text"
          disabled={isSubmitting}
          aria-invalid={!!errors.displayname}
          aria-describedby={errors.displayname ? "displayname-error" : undefined}
          {...register("displayname")}
        />
        {errors.displayname && (
          <p id="displayname-error" className="text-destructive text-xs">
            {errors.displayname.message}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="outlet_manager">
          Outlet Manager <span aria-hidden="true">*</span>
        </Label>
        <Input
          id="outlet_manager"
          type="text"
          disabled={isSubmitting}
          aria-invalid={!!errors.outlet_manager}
          aria-describedby={errors.outlet_manager ? "outlet-manager-error" : undefined}
          {...register("outlet_manager")}
        />
        {errors.outlet_manager && (
          <p id="outlet-manager-error" className="text-destructive text-xs">
            {errors.outlet_manager.message}
          </p>
        )}
      </div>

      {/* ── Address ─────────────────────────────────────────────────────── */}
      <fieldset className="space-y-4">
        <legend className="text-sm font-medium">Address</legend>

        <div className="space-y-1.5">
          <Label htmlFor="building">
            Building <span aria-hidden="true">*</span>
          </Label>
          <Input
            id="building"
            type="text"
            placeholder="e.g. Shop 1"
            disabled={isSubmitting}
            aria-invalid={!!errors.building}
            aria-describedby={errors.building ? "building-error" : undefined}
            {...register("building")}
          />
          {errors.building && (
            <p id="building-error" className="text-destructive text-xs">
              {errors.building.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="street">
            Street <span aria-hidden="true">*</span>
          </Label>
          <Input
            id="street"
            type="text"
            placeholder="e.g. MG Road"
            disabled={isSubmitting}
            aria-invalid={!!errors.street}
            aria-describedby={errors.street ? "street-error" : undefined}
            {...register("street")}
          />
          {errors.street && (
            <p id="street-error" className="text-destructive text-xs">
              {errors.street.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="location">
              City / Area <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="e.g. Bengaluru"
              disabled={isSubmitting}
              aria-invalid={!!errors.location}
              aria-describedby={errors.location ? "location-error" : undefined}
              {...register("location")}
            />
            {errors.location && (
              <p id="location-error" className="text-destructive text-xs">
                {errors.location.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="zip_code">
              Zip Code <span aria-hidden="true">*</span>
            </Label>
            <Input
              id="zip_code"
              type="text"
              placeholder="e.g. 560001"
              disabled={isSubmitting}
              aria-invalid={!!errors.zip_code}
              aria-describedby={errors.zip_code ? "zip-code-error" : undefined}
              {...register("zip_code")}
            />
            {errors.zip_code && (
              <p id="zip-code-error" className="text-destructive text-xs">
                {errors.zip_code.message}
              </p>
            )}
          </div>
        </div>
      </fieldset>

      {/* Submit */}
      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
        {isSubmitting ? "Saving…" : "Save Settings"}
      </Button>
    </form>
  );
}
