"use client";

import { useReactFlow } from "@xyflow/react";
import { ChevronDown, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { useState } from "react";
import { IconButton } from "@/shared/ui/atoms/IconButton";
import { Tooltip } from "@/shared/ui/atoms/Tooltip";
import { SearchBar } from "@/shared/ui/molecules/SearchBar";
import { cn } from "@/shared/lib/cn";
import {
  catalog,
  categories,
  categoryOrder,
  type CatalogItem,
} from "@/shared/domain/nodes/catalog";
import { useEditor } from "@/features/editor/store/editor";
import { CategoryIcon } from "@/features/editor/components/CategoryIcon";

export const DRAG_TYPE = "application/nodeflow-node";

const normalize = (value: string) => value.toLocaleLowerCase("tr-TR");

function LibraryCard({
  item,
  disabled,
  onAdd,
}: {
  item: CatalogItem;
  disabled: boolean;
  onAdd: (item: CatalogItem) => void;
}) {
  return (
    <button
      type="button"
      draggable={!disabled}
      disabled={disabled}
      onClick={() => onAdd(item)}
      onDragStart={(event) => {
        event.dataTransfer.setData(DRAG_TYPE, item.id);
        event.dataTransfer.effectAllowed = "copy";
      }}
      className={cn(
        "flex w-full items-start gap-2 rounded-md border border-line bg-surface p-2 text-left transition-colors duration-100",
        disabled
          ? "opacity-40"
          : "cursor-grab hover:border-primary-200 active:cursor-grabbing",
      )}
    >
      <CategoryIcon category={item.category} />
      <span className="min-w-0">
        <span className="block font-medium">{item.label}</span>
        <span className="block text-caption text-fg-muted">
          {disabled ? "Her workflow'da tek olur" : item.description}
        </span>
      </span>
    </button>
  );
}

export function NodeLibrary({
  collapsed,
  onCollapsedChange,
  overlay,
  onClose,
}: {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  overlay?: boolean;
  onClose?: () => void;
}) {
  const flow = useReactFlow();
  const addNode = useEditor((state) => state.addNode);
  const hasStart = useEditor((state) =>
    state.nodes.some((node) => node.data.category === "start"),
  );
  const [query, setQuery] = useState("");
  const [closedGroups, setClosedGroups] = useState<string[]>([]);
  const term = normalize(query.trim());

  const addAtCenter = (item: CatalogItem) => {
    const position = flow.screenToFlowPosition({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    });
    addNode(item.id, position);
    onClose?.();
  };

  if (collapsed && !overlay) {
    return (
      <aside className="flex w-14 shrink-0 flex-col items-center gap-2 border-r border-line bg-surface py-2">
        <IconButton
          label="Kütüphaneyi aç"
          tooltipSide="right"
          onClick={() => onCollapsedChange(false)}
        >
          <PanelLeftOpen size={20} strokeWidth={1.5} aria-hidden />
        </IconButton>
        {categoryOrder.map((category) => (
          <Tooltip key={category} content={categories[category].label} side="right">
            <span className="inline-flex size-10 items-center justify-center">
              <CategoryIcon category={category} />
            </span>
          </Tooltip>
        ))}
      </aside>
    );
  }

  return (
    <aside
      aria-label="Node kütüphanesi"
      className={cn(
        "flex shrink-0 flex-col border-line bg-surface",
        overlay
          ? "absolute inset-y-0 left-0 z-20 w-72 border-r shadow-elevation-4"
          : "w-60 border-r xl:w-[280px]",
      )}
    >
      <div className="flex items-center gap-2 p-3">
        <h2 className="flex-1 text-h3">Node Kütüphanesi</h2>
        {overlay ? (
          <IconButton label="Kütüphaneyi kapat" tooltip={false} onClick={onClose}>
            <X size={20} strokeWidth={1.5} aria-hidden />
          </IconButton>
        ) : (
          <IconButton
            label="Kütüphaneyi daralt"
            size="sm"
            tooltipSide="right"
            onClick={() => onCollapsedChange(true)}
          >
            <PanelLeftClose size={20} strokeWidth={1.5} aria-hidden />
          </IconButton>
        )}
      </div>
      <div className="px-3 pb-3">
        <SearchBar
          aria-label="Node ara"
          placeholder="Node ara…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {categoryOrder.map((category) => {
          const items = catalog.filter(
            (item) =>
              item.category === category &&
              (!term ||
                normalize(item.label).includes(term) ||
                normalize(item.description).includes(term)),
          );
          if (items.length === 0) return null;
          const closed = closedGroups.includes(category) && !term;
          return (
            <section key={category} className="mb-2">
              <button
                type="button"
                aria-expanded={!closed}
                onClick={() =>
                  setClosedGroups((value) =>
                    value.includes(category)
                      ? value.filter((item) => item !== category)
                      : [...value, category],
                  )
                }
                className="flex h-10 w-full items-center justify-between text-caption font-medium text-fg-muted hover:text-fg"
              >
                {categories[category].label}
                <ChevronDown
                  size={16}
                  strokeWidth={1.5}
                  aria-hidden
                  className={cn(
                    "transition-transform duration-100",
                    closed && "-rotate-90",
                  )}
                />
              </button>
              {!closed && (
                <div className="flex flex-col gap-2">
                  {items.map((item) => (
                    <LibraryCard
                      key={item.id}
                      item={item}
                      disabled={item.id === "start" && hasStart}
                      onAdd={addAtCenter}
                    />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </aside>
  );
}
