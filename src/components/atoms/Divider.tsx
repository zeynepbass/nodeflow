import { cn } from "@/lib/cn";

export function Divider({
  label,
  vertical,
  className,
}: {
  label?: string;
  vertical?: boolean;
  className?: string;
}) {
  if (vertical) {
    return (
      <span aria-hidden className={cn("mx-1 h-6 w-px bg-line", className)} />
    );
  }
  if (!label) return <hr className={cn("border-line", className)} />;
  return (
    <div className={cn("flex items-center gap-3 text-caption text-fg-muted", className)}>
      <span className="h-px flex-1 bg-line" />
      {label}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
