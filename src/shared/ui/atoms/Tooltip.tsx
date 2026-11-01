import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export type TooltipSide = "top" | "bottom" | "left" | "right";

const sides: Record<TooltipSide, string> = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
};

export function Tooltip({
  content,
  side = "top",
  children,
  className,
}: {
  content: ReactNode;
  side?: TooltipSide;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("group/tooltip relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute z-50 w-max max-w-60 rounded-sm bg-neutral-800 px-2 py-1 text-caption text-white",
          "opacity-0 transition-opacity delay-0 duration-100",
          "group-hover/tooltip:opacity-100 group-hover/tooltip:delay-200 group-focus-within/tooltip:opacity-100",
          sides[side],
        )}
      >
        {content}
      </span>
    </span>
  );
}
