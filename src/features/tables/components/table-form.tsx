import Link from "next/link";

import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableStatus } from "@/constants";

import type { UseTableFormResult } from "../hooks/use-table-form";

// ─── Status options for select ────────────────────────────────────────────────

const TABLE_STATUS_OPTIONS: { value: TableStatus; label: string }[] = [
  { value: TableStatus.AVAILABLE, label: "Available" },
  { value: TableStatus.RESERVED, label: "Reserved" },
  { value: TableStatus.MAINTENANCE, label: "Maintenance" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface TableFormProps {
  vm: UseTableFormResult;
  /** Page title shown in the header */
  title: string;
}

/**
 * TableForm — Zod-validated form for Add and Edit table (T-04).
 *
 * Receives the ViewModel (UseTableFormResult) from the page so this component
 * contains only JSX. Both add and edit modes are handled by the same form.
 *
 * Occupied/Cleaning statuses are intentionally excluded from the create/edit
 * form — those transitions are handled operationally (T-05).
 */
export function TableForm({ vm, title }: TableFormProps) {
  const { form, isLoadingTable, isSubmitting, submitError, onSubmit } = vm;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  if (isLoadingTable) {
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
        <Link href="/tables/management">
          <Button variant="ghost" size="icon" aria-label="Back to table management">
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

        {/* Table Number */}
        <div className="space-y-1.5">
          <Label htmlFor="table_number">
            Table Number <span aria-hidden="true">*</span>
          </Label>
          <Input
            id="table_number"
            type="text"
            placeholder="e.g. 1, A1, VIP-1"
            disabled={isSubmitting}
            aria-invalid={!!errors.table_number}
            aria-describedby={errors.table_number ? "table-number-error" : undefined}
            {...register("table_number")}
          />
          {errors.table_number && (
            <p id="table-number-error" className="text-destructive text-xs">
              {errors.table_number.message}
            </p>
          )}
        </div>

        {/* Capacity */}
        <div className="space-y-1.5">
          <Label htmlFor="capacity">
            Capacity (seats) <span aria-hidden="true">*</span>
          </Label>
          <Input
            id="capacity"
            type="number"
            min={1}
            max={50}
            disabled={isSubmitting}
            aria-invalid={!!errors.capacity}
            aria-describedby={errors.capacity ? "capacity-error" : undefined}
            {...register("capacity")}
          />
          {errors.capacity && (
            <p id="capacity-error" className="text-destructive text-xs">
              {errors.capacity.message}
            </p>
          )}
        </div>

        {/* Floor */}
        <div className="space-y-1.5">
          <Label htmlFor="floor">
            Floor <span aria-hidden="true">*</span>
          </Label>
          <Input
            id="floor"
            type="number"
            min={0}
            max={99}
            disabled={isSubmitting}
            aria-invalid={!!errors.floor}
            aria-describedby={errors.floor ? "floor-error" : undefined}
            {...register("floor")}
          />
          {errors.floor && (
            <p id="floor-error" className="text-destructive text-xs">
              {errors.floor.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            disabled={isSubmitting}
            aria-invalid={!!errors.status}
            aria-describedby={errors.status ? "status-error" : undefined}
            className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 h-8 w-full rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50"
            {...register("status")}
          >
            {TABLE_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {errors.status && (
            <p id="status-error" className="text-destructive text-xs">
              {errors.status.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-2 pt-2">
          <Link href="/tables/management">
            <Button type="button" variant="outline" size="sm" disabled={isSubmitting}>
              Cancel
            </Button>
          </Link>
          <Button type="submit" size="sm" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 size-3.5 animate-spin" />
                Saving…
              </>
            ) : vm.mode === "add" ? (
              "Add Table"
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
