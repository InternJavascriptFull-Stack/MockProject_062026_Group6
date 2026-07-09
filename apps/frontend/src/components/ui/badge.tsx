import * as React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "priority" | "warning" | "alert" | "muted";
}

/**
 * Reusable Badge component matching shadcn/ui.
 */
export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:outline-none",
        variant === "default" &&
          "bg-brand-primary-dark border-transparent text-white",
        variant === "priority" && "bg-emerald-100 text-emerald-700 border-emerald-400",
        variant === "warning" &&
          "bg-amber-100 text-amber-700 border-amber-400",
        variant === "alert" &&
          "bg-red-100 text-red-700 border-red-300",
        variant === "muted" && "bg-slate-100 text-slate-500 border-slate-300",
        className,
      )}
      {...props}
    />
  );
}
