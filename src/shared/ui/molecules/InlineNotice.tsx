import { CircleAlert, CircleCheck, Info, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

const variants: Record<
  "error" | "success" | "info",
  { icon: LucideIcon; className: string }
> = {
  error: { icon: CircleAlert, className: "bg-soft-error text-on-soft-error" },
  success: { icon: CircleCheck, className: "bg-soft-success text-on-soft-success" },
  info: { icon: Info, className: "bg-soft-info text-on-soft-info" },
};

export function InlineNotice({
  variant = "info",
  className,
  children,
}: {
  variant?: "error" | "success" | "info";
  className?: string;
  children: ReactNode;
}) {
  const { icon: Icon, className: tone } = variants[variant];
  return (
    <div
      aria-live="polite"
      className={cn(
        "flex items-start gap-2 rounded-sm px-3 py-2 text-body",
        tone,
        className,
      )}
    >
      <Icon size={16} strokeWidth={1.5} aria-hidden className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
