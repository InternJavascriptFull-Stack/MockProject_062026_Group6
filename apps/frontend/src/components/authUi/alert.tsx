import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Alert({ className, ...props }: ComponentProps<"div">) {
  return <div role="alert" className={cn("rounded-lg border p-4", className)} {...props} />;
}

export function AlertTitle({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("font-medium", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("text-sm", className)} {...props} />;
}
