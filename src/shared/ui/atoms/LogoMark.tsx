import { cn } from "@/shared/lib/cn";

export function LogoMark({
  size = 32,
  wordmark = false,
  className,
}: {
  size?: number;
  wordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        aria-hidden
        className="shrink-0"
      >
        <rect width="32" height="32" rx="8" fill="var(--action-primary)" />
        <circle cx="9" cy="16" r="3.5" fill="#fff" />
        <circle cx="23" cy="9" r="3.5" fill="#7FE6DF" />
        <circle cx="23" cy="23" r="3.5" fill="#fff" />
        <path
          d="M12 16c5 0 4-7 8-7M12 16c5 0 4 7 8 7"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {wordmark && <span className="text-h3 text-fg">NodeFlow</span>}
      {!wordmark && <span className="sr-only">NodeFlow</span>}
    </span>
  );
}
