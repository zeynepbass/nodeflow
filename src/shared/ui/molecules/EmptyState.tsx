import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-4 py-20 text-center">
      <span className="mb-4 inline-flex size-16 items-center justify-center rounded-xl bg-soft-primary text-on-soft-primary">
        <Icon size={32} strokeWidth={2} aria-hidden />
      </span>
      <h2 className="text-h2">{title}</h2>
      {description && (
        <p className="mt-1 max-w-[68ch] text-body-lg text-fg-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
