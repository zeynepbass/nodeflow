"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Ban,
  Check,
  Copy,
  MoreHorizontal,
  Pencil,
  Power,
  Trash2,
  X,
} from "lucide-react";
import { memo, useMemo, type CSSProperties } from "react";
import { Menu } from "@/shared/ui/molecules/Menu";
import { cn } from "@/shared/lib/cn";
import { categories } from "@/shared/domain/nodes/catalog";
import { hasErrors } from "@/shared/domain/nodes/validation";
import { useEditor, type FlowNode } from "@/features/editor/store/editor";
import { CategoryIcon } from "@/features/editor/components/CategoryIcon";
import { nodeSummary } from "@/features/editor/lib/summary";

function FlowNodeCardBase({ id, data, selected }: NodeProps<FlowNode>) {
  const meta = categories[data.category];
  const invalid = useMemo(() => hasErrors(data), [data]);
  const duplicateNodes = useEditor((state) => state.duplicateNodes);
  const removeNodes = useEditor((state) => state.removeNodes);
  const toggleDisabled = useEditor((state) => state.toggleDisabled);
  const selectNode = useEditor((state) => state.selectNode);
  const isEnd = data.category === "end";
  const isStart = data.category === "start";

  return (
    <div
      data-testid="node-karti"
      data-selected={selected}
      data-run={data.runStatus}
      data-invalid={invalid}
      data-disabled={data.disabled}
      style={{ "--kategori": meta.color } as CSSProperties}
      className={cn(
        "dugum relative w-[220px] min-h-16 rounded-lg transition-colors duration-100",
        isEnd ? "bg-neutral-800 text-white" : "bg-surface text-fg",
        data.disabled && "opacity-40",
      )}
    >
      {meta.hasInput && <Handle type="target" position={Position.Left} />}
      <div
        className="flex h-8 items-center gap-2 rounded-t-[10px] pl-2 pr-1"
        style={{
          backgroundColor: isStart
            ? "transparent"
            : `color-mix(in srgb, ${meta.color} 10%, transparent)`,
        }}
      >
        <CategoryIcon category={data.category} />
        <span className="min-w-0 flex-1 truncate font-semibold">{data.label}</span>
        {invalid && (
          <span
            title="Bu node'da eksik veya hatalı alan var"
            className="size-2 shrink-0 rounded-full bg-state-error"
          />
        )}
        <Menu
          items={[
            { label: "Düzenle", icon: Pencil, onSelect: () => selectNode(id) },
            {
              label: "Kopyala",
              icon: Copy,
              disabled: isStart,
              onSelect: () => duplicateNodes([id]),
            },
            {
              label: data.disabled ? "Etkinleştir" : "Devre Dışı Bırak",
              icon: data.disabled ? Power : Ban,
              onSelect: () => toggleDisabled(id),
            },
            {
              label: "Sil",
              icon: Trash2,
              danger: true,
              disabled: isStart,
              onSelect: () => removeNodes([id]),
            },
          ]}
          trigger={({ open, toggle }) => (
            <button
              type="button"
              aria-label={`${data.label} menüsü`}
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={toggle}
              className={cn(
                "inline-flex size-6 items-center justify-center rounded-xs hover:bg-[color-mix(in_srgb,currentColor_12%,transparent)]",
                isEnd ? "text-neutral-300" : "text-fg-muted",
              )}
            >
              <MoreHorizontal size={16} strokeWidth={1.5} aria-hidden />
            </button>
          )}
        />
      </div>
      <p
        className={cn(
          "truncate px-2 pb-2 pt-1 text-caption",
          isEnd ? "text-neutral-300" : "text-fg-muted",
        )}
      >
        {nodeSummary(data)}
      </p>

      {data.runStatus === "success" && (
        <span className="absolute -right-2 -top-2 inline-flex size-5 animate-fade-in items-center justify-center rounded-full bg-state-success text-white">
          <Check size={14} strokeWidth={2} aria-label="Başarılı" />
        </span>
      )}
      {data.runStatus === "error" && (
        <span className="absolute -right-2 -top-2 inline-flex size-5 items-center justify-center rounded-full bg-state-error text-white">
          <X size={14} strokeWidth={2} aria-label="Hatalı" />
        </span>
      )}

      {meta.outputs === 1 && <Handle type="source" position={Position.Right} />}
      {meta.outputs === 2 && (
        <>
          <Handle
            type="source"
            id="yes"
            position={Position.Right}
            style={{ top: "34%", "--kategori": "var(--state-success)" } as CSSProperties}
          />
          <span className="pointer-events-none absolute -right-8 top-[18%] text-micro text-on-soft-success">
            Evet
          </span>
          <Handle
            type="source"
            id="no"
            position={Position.Right}
            style={{ top: "76%", "--kategori": "var(--state-error)" } as CSSProperties}
          />
          <span className="pointer-events-none absolute -right-9 top-[62%] text-micro text-on-soft-error">
            Hayır
          </span>
        </>
      )}
    </div>
  );
}

export const FlowNodeCard = memo(FlowNodeCardBase);
