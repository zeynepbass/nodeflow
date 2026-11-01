import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";
import { Tooltip, type TooltipSide } from "@/shared/ui/atoms/Tooltip";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  size?: "sm" | "md";
  tooltipSide?: TooltipSide;
  tooltip?: boolean;
}

export function IconButton({
  label,
  size = "md",
  tooltipSide = "bottom",
  tooltip = true,
  className,
  children,
  type = "button",
  ...props
}: IconButtonProps) {
  const button = (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-sm text-fg-muted",
        "transition-colors duration-100 hover:bg-surface-hover hover:text-fg active:bg-line",
        "disabled:opacity-40 disabled:pointer-events-none",
        size === "md" ? "size-10" : "size-8",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
  if (!tooltip) return button;
  return (
    <Tooltip content={label} side={tooltipSide}>
      {button}
    </Tooltip>
  );
}
