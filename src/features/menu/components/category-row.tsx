import Link from "next/link";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { CategoryDto } from "../types";

interface CategoryRowProps {
  category: CategoryDto;
  onDelete: (category: CategoryDto) => void;
  isDeleting: boolean;
}

export function CategoryRow({ category, onDelete, isDeleting }: CategoryRowProps) {
  return (
    <tr className="hover:bg-muted/50 border-b transition-colors last:border-0">
      {/* Name */}
      <td className="px-4 py-3">
        <span className="text-sm font-medium">{category.name}</span>
      </td>

      {/* Description */}
      <td className="text-muted-foreground px-4 py-3 text-sm">{category.description ?? "—"}</td>

      {/* Display order */}
      <td className="px-4 py-3 text-sm">{category.display_order}</td>

      {/* Status */}
      <td className="px-4 py-3">
        <span
          className={
            category.is_active
              ? "inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
              : "inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700"
          }
        >
          {category.is_active ? "Active" : "Inactive"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Link href={`/categories/${category.id}/edit`}>
            <Button variant="ghost" size="icon-sm" aria-label={`Edit ${category.name}`}>
              <Pencil className="size-3.5" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${category.name}`}
            onClick={() => onDelete(category)}
            disabled={isDeleting}
          >
            <Trash2 className="text-destructive size-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
