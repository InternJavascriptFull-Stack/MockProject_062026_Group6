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
        variant === "priority" && "border-transparent bg-teal-500 text-white",
        variant === "warning" &&
          "bg-brand-alert-bg text-brand-alert-text border-transparent",
        variant === "alert" &&
          "bg-brand-alert-bg text-brand-alert-text border-transparent",
        variant === "muted" && "border-transparent bg-[#e6e6e7] text-[#87888a]",
        className,
      )}
      {...props}
    />
  );
}
