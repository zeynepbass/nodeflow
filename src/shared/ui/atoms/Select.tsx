import { ChevronDown } from "lucide-react";
import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";
import { fieldClass } from "@/shared/ui/atoms/Input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { invalid, options, className, ...props },
  ref,
) {
  return (
    <span className={cn("relative block", className)}>
      <select
        ref={ref}
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
});
