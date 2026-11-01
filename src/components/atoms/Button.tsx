import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-action text-white hover:bg-action-hover active:bg-action-active",
  secondary:
    "bg-surface text-fg border border-line hover:bg-surface-hover active:bg-line",
  ghost:
    "bg-transparent text-fg-muted hover:bg-surface-hover hover:text-fg active:bg-line",
  destructive: "bg-error-500 text-white hover:bg-error-700 active:bg-error-700",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-body font-medium rounded-sm",
  md: "h-10 px-4 text-body font-medium rounded-sm",
  lg: "h-12 px-5 text-body-lg font-medium rounded-md",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cn(
    "relative inline-flex items-center justify-center gap-2 whitespace-nowrap select-none",
    "transition-[background-color,color,transform] duration-100 ease-out active:scale-[0.98]",
    "disabled:opacity-40 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className,
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass(variant, size, className)}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size={16} />
        </span>
      )}
      <span
        className={cn(
          "inline-flex items-center gap-2",
          loading && "invisible",
        )}
      >
        {children}
      </span>
    </button>
  );
}
