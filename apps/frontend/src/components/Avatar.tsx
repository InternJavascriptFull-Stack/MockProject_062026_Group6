import { cn } from "../utils/cn";

interface AvatarProps {
  initials?: string;
  className?: string;
}

export function Avatar({ initials, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center  bg-cyan-accent text-navy font-medium",
        className
      )}
    >
      {initials || ""}
    </div>
  );
}
