import * as React from "react";
import { cn } from "../../lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  barClassName?: string;
}

/**
 * Reusable Progress bar component matching shadcn/ui.
 */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, barClassName, ...props }, ref) => {
    // Enforce bounds
    const percent = Math.min(100, Math.max(0, value));

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-slate-200",
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            "bg-brand-primary-light h-full w-full flex-1 transition-all duration-300",
            barClassName,
          )}
          style={{ transform: `translateX(-${100 - percent}%)` }}
        />
      </div>
    );
  },
);

Progress.displayName = "Progress";
