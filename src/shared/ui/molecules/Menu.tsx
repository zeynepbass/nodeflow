"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/cn";

export interface MenuItem {
  label: string;
  icon?: LucideIcon;
  danger?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export function Menu({
  trigger,
  items,
  align = "right",
  direction = "down",
  className,
}: {
  trigger: (props: {
    open: boolean;
    toggle: (event: React.MouseEvent) => void;
  }) => ReactNode;
  items: MenuItem[];
  align?: "left" | "right";
  direction?: "up" | "down";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={cn("nodrag relative inline-flex", className)}>
      {trigger({
        open,
        toggle: (event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        },
      })}
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute z-40 min-w-44 animate-fade-in rounded-md border border-line bg-surface p-1 shadow-elevation-2",
            align === "right" ? "right-0" : "left-0",
            direction === "down" ? "top-full mt-1" : "bottom-full mb-1",
          )}
        >
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={(event) => {
                event.stopPropagation();
                setOpen(false);
                item.onSelect();
              }}
              className={cn(
                "flex h-10 w-full items-center gap-2 whitespace-nowrap rounded-xs px-2 text-left text-body hover:bg-surface-hover disabled:opacity-40",
                item.danger ? "text-state-error" : "text-fg",
              )}
            >
              {item.icon && <item.icon size={16} strokeWidth={1.5} aria-hidden />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
