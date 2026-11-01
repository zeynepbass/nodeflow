import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "error";

const variants: Record<BadgeVariant, string> = {
  neutral: "bg-soft-neutral text-on-soft-neutral",
  primary: "bg-soft-primary text-on-soft-primary",
  success: "bg-soft-success text-on-soft-success",
  warning: "bg-soft-warning text-on-soft-warning",
  error: "bg-soft-error text-on-soft-error",
};

export function Badge({
  variant = "neutral",
  className,
  children,
}: {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1 whitespace-nowrap rounded-xs px-2 text-micro",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
