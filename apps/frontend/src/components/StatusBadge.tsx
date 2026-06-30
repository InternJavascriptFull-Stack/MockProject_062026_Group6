import type { StatusType } from "../types/patient";
import { cn } from "../utils/cn";

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md px-2.5 py-1 text-xs font-medium",
        {
          "bg-navy text-white": status === "Active",
          "bg-red-500 text-white": status === "Inactive",
          "bg-cyan-accent text-teal-800": status === "New Patient",
        }
      )}
    >
      {status}
    </span>
  );
}
