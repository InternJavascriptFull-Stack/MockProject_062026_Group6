import * as React from "react";
import { cn } from "../../lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * Reusable Checkbox component styling peer checkboxes.
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onCheckedChange) {
        onCheckedChange(e.target.checked);
      }
    };

    return (
      <label className="relative flex cursor-pointer items-center justify-center select-none">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={handleChange}
          ref={ref}
          {...props}
        />
        <div
          className={cn(
            "border-slate-350 peer-checked:bg-brand-primary-dark peer-checked:border-brand-primary-dark peer-focus:ring-slate-350 flex h-5 w-5 items-center justify-center rounded border bg-white text-white transition-all peer-focus:ring-2 peer-checked:[&_svg]:scale-100 peer-checked:[&_svg]:opacity-100",
            className,
          )}
        >
          <Check className="h-3.5 w-3.5 scale-75 stroke-[3] opacity-0 transition-all duration-150" />
        </div>
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
