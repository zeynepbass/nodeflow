"use client";

import { normalizeText } from "@/shared/lib/text";
import { useState } from "react";
import { SearchBar } from "@/shared/ui/molecules/SearchBar";
import { Modal } from "@/shared/ui/molecules/Modal";
import { catalog, categories, categoryOrder } from "@/shared/domain/nodes/catalog";
import { useEditor } from "@/features/editor/store/editor";
import { CategoryIcon } from "@/features/editor/components/CategoryIcon";

export function NodePicker() {
  const target = useEditor((state) => state.pickerTarget);
  const setTarget = useEditor((state) => state.setPickerTarget);
  const insertOnEdge = useEditor((state) => state.insertOnEdge);
  const insertAfter = useEditor((state) => state.insertAfter);
  const [query, setQuery] = useState("");

  const close = () => {
    setTarget(null);
    setQuery("");
  };

  const pick = (catalogId: string) => {
    if (target?.kind === "edge") insertOnEdge(target.edgeId, catalogId);
    if (target?.kind === "after") {
      insertAfter(target.nodeId, target.handle, catalogId);
    }
    close();
  };

  const term = normalizeText(query.trim());

  return (
    <Modal open={target !== null} onClose={close} title="Node ekle">
      <SearchBar
        autoFocus
        aria-label="Node ara"
        placeholder="Node ara…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="mt-3 flex max-h-96 flex-col gap-3 overflow-y-auto">
        {categoryOrder
          .filter((category) => category !== "start")
          .map((category) => {
            const items = catalog.filter(
              (item) =>
                item.category === category &&
                (!term || normalizeText(item.label).includes(term)),
            );
            if (items.length === 0) return null;
            return (
              <section key={category}>
                <h3 className="mb-1 text-caption font-medium text-fg-muted">
                  {categories[category].label}
                </h3>
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => pick(item.id)}
                    className="flex min-h-11 w-full items-center gap-2 rounded-sm px-2 text-left hover:bg-surface-hover"
                  >
                    <CategoryIcon category={item.category} />
                    <span>
                      <span className="block font-medium">{item.label}</span>
                      <span className="block text-caption text-fg-muted">
                        {item.description}
                      </span>
                    </span>
                  </button>
                ))}
              </section>
            );
          })}
      </div>
    </Modal>
  );
}
