import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: ReactNode;
}

export function Radio({ label, className, ...props }: RadioProps) {
  return (
    <label className={cn("inline-flex items-center gap-2 text-body", className)}>
      <input type="radio" className="size-4 accent-[var(--action-primary)]" {...props} />
      <span>{label}</span>
    </label>
  );
}
