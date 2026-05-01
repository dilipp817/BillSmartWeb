"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { FoodListItem } from "../types";

interface DeleteFoodDialogProps {
  food: FoodListItem;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

/**
 * DeleteFoodDialog — inline confirmation panel shown before soft-deleting a food item.
 *
 * Soft-delete means the item is flagged as deleted on the backend; it disappears from
 * all GET responses but remains in the DB to preserve order history.
 *
 * Renders as an overlay within the page (no portal/modal library needed here).
 */
export function DeleteFoodDialog({ food, onConfirm, onCancel, isDeleting }: DeleteFoodDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-food-title"
      className="bg-background fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
    >
      <div className="bg-background w-full max-w-sm rounded-xl border p-6 shadow-lg">
        <div className="mb-4 flex items-start gap-3">
          <AlertTriangle className="text-destructive mt-0.5 size-5 shrink-0" />
          <div>
            <h2 id="delete-food-title" className="text-base font-semibold">
              Delete &ldquo;{food.name}&rdquo;?
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              This will permanently remove the item from your menu. Orders that already contain this
              item are not affected.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" size="sm" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
