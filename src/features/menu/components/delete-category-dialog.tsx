"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { CategoryDto } from "../types";

interface DeleteCategoryDialogProps {
  category: CategoryDto;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

/**
 * DeleteCategoryDialog — inline confirmation panel before hard-deleting a category.
 *
 * ⚠️ Category delete is a HARD delete — the record is permanently removed from the DB.
 * Deleting a category does not delete its foods but those foods will lose their category link.
 */
export function DeleteCategoryDialog({
  category,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteCategoryDialogProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-category-title"
      className="bg-background fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
    >
      <div className="bg-background w-full max-w-sm rounded-xl border p-6 shadow-lg">
        <div className="mb-4 flex items-start gap-3">
          <AlertTriangle className="text-destructive mt-0.5 size-5 shrink-0" />
          <div>
            <h2 id="delete-category-title" className="text-base font-semibold">
              Delete &ldquo;{category.name}&rdquo;?
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              This will permanently delete the category. Foods in this category will not be deleted
              but will lose their category assignment.
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
