import { categories } from "@/lib/nodes/catalog";
import type { NodeCategory } from "@/lib/types";

export function CategoryIcon({
  category,
  size = 20,
}: {
  category: NodeCategory;
  size?: number;
}) {
  const { icon: Icon, color } = categories[category];
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
