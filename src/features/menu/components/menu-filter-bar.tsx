"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import type { CategoryDto } from "../types";

interface MenuFilterBarProps {
  search: string;
  categoryId: number | null;
  categories: CategoryDto[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (categoryId: number | null) => void;
}

export function MenuFilterBar({
  search,
  categoryId,
  categories,
  onSearchChange,
  onCategoryChange,
}: MenuFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative w-full sm:w-64">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder="Search food name…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Category filter */}
      <select
        value={categoryId ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          onCategoryChange(val === "" ? null : Number(val));
        }}
        className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border px-2.5 text-sm outline-none focus-visible:ring-3"
        aria-label="Filter by category"
      >
        <option value="">All categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}
