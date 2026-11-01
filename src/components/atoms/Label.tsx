import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ required, className, children, ...props }: LabelProps) {
  return (
    <label className={cn("text-body font-medium text-fg", className)} {...props}>
      {children}
      {required && (
        <>
          <span aria-hidden className="ml-0.5 text-state-error">
            *
          </span>
          <span className="sr-only"> (zorunlu)</span>
        </>
      )}
    </label>
  );
}
