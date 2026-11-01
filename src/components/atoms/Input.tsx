import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const fieldClass = (invalid?: boolean, mono?: boolean) =>
  cn(
    "w-full rounded-sm border bg-surface px-3 text-fg outline-none transition-[border-color,box-shadow] duration-100",
    "focus:border-primary-500 focus:shadow-[0_0_0_3px_var(--focus-glow)]",
    "disabled:border-transparent disabled:bg-surface-hover disabled:text-fg-disabled disabled:cursor-not-allowed",
    mono ? "font-mono text-code" : "text-body",
    invalid ? "border-error-500" : "border-line",
  );

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  mono?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid, mono, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        fieldClass(invalid, mono),
        "h-10 read-only:bg-surface-hover read-only:focus:shadow-none",
        className,
      )}
      {...props}
    />
  );
});
