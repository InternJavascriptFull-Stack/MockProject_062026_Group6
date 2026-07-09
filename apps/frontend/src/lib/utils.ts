import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge ClassNames safely using clsx and tailwind-merge.
 *
 * @param inputs Array of class values to merge.
 * @returns Concatenated and merged class name string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
