import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
}

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={cn("inline-flex items-start gap-2 text-body", className)}>
      <input
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 rounded-xs accent-[var(--action-primary)]"
        {...props}
      />
      {label && <span>{label}</span>}
    </label>
  );
}
