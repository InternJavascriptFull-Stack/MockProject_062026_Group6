import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "sm" | "md" | "lg";
}

/**
 * Reusable Button component styled with Tailwind and brand colors.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", children, ...props },
    ref,
  ) => {
    return (
      <button
        className={cn(
          "inline-flex cursor-pointer items-center justify-center rounded-lg font-medium tracking-wide transition-all duration-150 focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:outline-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
          // Variants
          variant === "primary" &&
            "bg-brand-primary-dark text-white shadow-sm hover:opacity-95",
          variant === "secondary" &&
            "bg-brand-primary-light text-brand-primary-dark hover:bg-opacity-90",
          variant === "outline" &&
            "border-brand-border text-brand-primary-dark border bg-white hover:bg-slate-50",
          variant === "ghost" && "text-brand-primary-dark hover:bg-slate-100",
          variant === "link" &&
            "text-brand-primary-dark p-0 underline-offset-4 hover:underline",
          // Sizes
          size === "sm" && "h-8 px-3 text-xs",
          size === "md" && "h-10 px-4 text-sm",
          size === "lg" && "h-11 px-5 text-base",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
