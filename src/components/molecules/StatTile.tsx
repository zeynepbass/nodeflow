import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export function StatTile({
  icon: Icon,
  label,
  value,
  trend,
  valueClassName,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: { direction: "up" | "down"; label: string };
  valueClassName?: string;
}) {
  const TrendIcon = trend?.direction === "down" ? TrendingDown : TrendingUp;
  return (
    <div className="rounded-xl bg-surface p-5 shadow-elevation-1 transition-shadow duration-150 hover:shadow-elevation-2">
      <div className="flex items-center justify-between text-fg-muted">
        <span className="text-body font-medium">{label}</span>
        <Icon size={20} strokeWidth={1.5} aria-hidden />
      </div>
      <p className={cn("mt-3 text-[28px] font-bold leading-9", valueClassName)}>
        {value}
      </p>
      {trend && (
        <p className="mt-1 flex items-center gap-1 text-caption text-fg-muted">
          <TrendIcon size={14} strokeWidth={1.5} aria-hidden />
          {trend.label}
        </p>
      )}
    </div>
  );
}

export function StatTileSkeleton() {
  return (
    <div aria-hidden className="rounded-xl bg-surface p-5 shadow-elevation-1">
      <div className="iskelet h-5 w-28 rounded-xs" />
      <div className="iskelet mt-3 h-9 w-20 rounded-xs" />
    </div>
  );
}
