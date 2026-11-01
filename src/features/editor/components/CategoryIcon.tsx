import {
  CirclePlay,
  Cpu,
  Database,
  Flag,
  Split,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { categories } from "@/shared/domain/nodes/catalog";
import type { NodeCategory } from "@/shared/domain/types";

const icons: Record<NodeCategory, LucideIcon> = {
  start: CirclePlay,
  trigger: Zap,
  action: Cpu,
  condition: Split,
  data: Database,
  end: Flag,
};

export function CategoryIcon({
  category,
  size = 20,
}: {
  category: NodeCategory;
  size?: number;
}) {
  const Icon = icons[category];
  const { color } = categories[category];
  const isEnd = category === "end";
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        backgroundColor: isEnd ? "var(--neutral-800)" : color,
        color: isEnd ? "var(--success-500)" : "#fff",
      }}
      className="inline-flex shrink-0 items-center justify-center rounded-xs"
    >
      <Icon size={size * 0.7} strokeWidth={2} />
    </span>
  );
}
