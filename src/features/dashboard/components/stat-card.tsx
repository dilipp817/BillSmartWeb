import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  /** When true, shows a pulsing skeleton instead of value */
  isLoading?: boolean;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  isLoading = false,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground ring-foreground/10 flex items-center gap-4 rounded-xl p-5 ring-1",
        className
      )}
    >
      <div className="bg-accent text-accent-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground truncate text-sm">{label}</p>
        {isLoading ? (
          <div className="bg-muted mt-1 h-7 w-20 animate-pulse rounded" aria-label="Loading" />
        ) : (
          <p className="text-2xl leading-tight font-semibold">{value}</p>
        )}
      </div>
    </div>
  );
}
