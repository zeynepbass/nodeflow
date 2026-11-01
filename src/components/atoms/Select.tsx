import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { fieldClass } from "./Input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  options: { value: string; label: string }[];
}

export function Select({ invalid, options, className, ...props }: SelectProps) {
  return (
    <span className={cn("relative block", className)}>
      <select
        aria-invalid={invalid || undefined}
        className={cn(fieldClass(invalid), "h-10 appearance-none pr-8")}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        strokeWidth={1.5}
        aria-hidden
        className="pointer-events-none absolute right-2.5 top-3 text-fg-muted"
      />
    </span>
  );
}
