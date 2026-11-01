import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

export function SettingsSection({
  icon: Icon,
  title,
  description,
  aside,
  footer,
  danger,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  aside?: ReactNode;
  footer?: ReactNode;
  danger?: boolean;
  children?: ReactNode;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-xl bg-surface shadow-elevation-1",
        danger && "ring-1 ring-error-500/40",
      )}
    >
      <header className="flex items-start gap-3 p-5">
        <span
          className={cn(
            "inline-flex size-10 shrink-0 items-center justify-center rounded-lg",
            danger
              ? "bg-soft-error text-on-soft-error"
              : "bg-soft-primary text-on-soft-primary",
          )}
        >
          <Icon size={20} strokeWidth={1.5} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className={cn("text-h3", danger && "text-state-error")}>{title}</h2>
          {description && (
            <p className="mt-0.5 text-caption text-fg-muted">{description}</p>
          )}
        </div>
        {aside}
      </header>
      {children && <div className="border-t border-line p-5">{children}</div>}
      {footer && (
        <footer className="flex items-center justify-end gap-2 border-t border-line bg-surface-hover px-5 py-3">
          {footer}
        </footer>
      )}
    </section>
  );
}
