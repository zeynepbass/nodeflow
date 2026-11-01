import { cn } from "@/shared/lib/cn";

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  className,
}: {
  value: T;
  options: { value: T; label: React.ReactNode; ariaLabel?: string }[];
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn("inline-flex rounded-sm bg-surface-hover p-0.5", className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          aria-label={option.ariaLabel}
          onClick={() => onChange(option.value)}
          className={cn(
            "inline-flex h-8 min-w-8 flex-1 items-center justify-center gap-1 rounded-xs px-2 text-body font-medium transition-colors duration-100",
            option.value === value
              ? "bg-surface text-fg shadow-elevation-1"
              : "text-fg-muted hover:text-fg",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
