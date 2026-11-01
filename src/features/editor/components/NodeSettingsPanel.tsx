"use client";

import { ArrowLeft, Play, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/atoms/Button";
import { IconButton } from "@/shared/ui/atoms/IconButton";
import { Input } from "@/shared/ui/atoms/Input";
import { Textarea } from "@/shared/ui/atoms/Textarea";
import { Toggle } from "@/shared/ui/atoms/Toggle";
import { FormField } from "@/shared/ui/molecules/FormField";
import { InlineNotice } from "@/shared/ui/molecules/InlineNotice";
import { cn } from "@/shared/lib/cn";
import { findCatalogItem } from "@/shared/domain/nodes/catalog";
import { runNode, type NodeRun } from "@/shared/domain/nodes/engine";
import { isFieldVisible, validateNode } from "@/shared/domain/nodes/validation";
import { useEditor, type FlowNode, type PanelTab } from "@/features/editor/store/editor";
import type { FlowNodeData } from "@/shared/domain/types";
import { CategoryIcon } from "@/features/editor/components/CategoryIcon";
import { ConditionBuilder } from "@/features/editor/components/ConditionBuilder";
import { JsonView } from "@/features/editor/components/JsonView";
import { ParamField } from "@/features/editor/components/ParamField";

const tabs: { id: PanelTab; label: string }[] = [
  { id: "general", label: "Genel" },
  { id: "params", label: "Parametreler" },
  { id: "test", label: "Test" },
];

function TestTab({ data }: { data: FlowNodeData }) {
  const setPanelTab = useEditor((state) => state.setPanelTab);
  const [result, setResult] = useState<NodeRun | null>(null);
  const failure = result ? result.error : data.runError;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-fg-muted">
        Node örnek bir girdiyle tek başına çalıştırılır; akışın geri kalanı
        etkilenmez.
      </p>
      <Button variant="secondary" onClick={() => setResult(runNode(data))}>
        <Play size={16} strokeWidth={1.5} aria-hidden />
        Bu Node&apos;u Test Et
      </Button>
      {failure && (
        <InlineNotice variant="error">
          <p>{failure}</p>
          <button
            type="button"
            onClick={() => setPanelTab("params")}
            className="mt-1 font-medium underline"
          >
            Nasıl düzeltirim?
          </button>
        </InlineNotice>
      )}
      {result && <JsonView value={result.output} error={!result.ok} />}
    </div>
  );
}

export function NodeSettingsPanel({
  node,
  fullScreen,
}: {
  node: FlowNode;
  fullScreen?: boolean;
}) {
  const data = node.data;
  const tab = useEditor((state) => state.panelTab);
  const setTab = useEditor((state) => state.setPanelTab);
  const update = useEditor((state) => state.updateNodeData);
  const applyDraft = useEditor((state) => state.applyDraft);
  const cancelDraft = useEditor((state) => state.cancelDraft);
  const clearSelection = useEditor((state) => state.clearSelection);
  const dirty = useEditor((state) => state.draftBase?.id === node.id);
  const errors = useMemo(() => validateNode(data), [data]);
  const fields = (findCatalogItem(data.catalogId)?.fields ?? []).filter((field) =>
    isFieldVisible(field, data),
  );
  const hasError = Object.keys(errors).length > 0;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-2 border-b border-line px-3 py-2">
        {fullScreen && (
          <IconButton label="Listeye dön" tooltip={false} onClick={clearSelection}>
            <ArrowLeft size={20} strokeWidth={1.5} aria-hidden />
          </IconButton>
        )}
        <CategoryIcon category={data.category} size={24} />
        <h2 className="min-w-0 flex-1 truncate text-h3">{data.label}</h2>
        {hasError && (
          <span
            title="Bu node'da eksik veya hatalı alan var"
            className="size-2 shrink-0 rounded-full bg-state-error"
          />
        )}
        {!fullScreen && (
          <IconButton
            label="Seçimi kaldır"
            size="sm"
            tooltipSide="left"
            onClick={clearSelection}
          >
            <X size={20} strokeWidth={1.5} aria-hidden />
          </IconButton>
        )}
      </header>

      <div role="tablist" aria-label="Node ayarları" className="flex border-b border-line px-3">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "-mb-px h-10 flex-1 border-b-2 px-1 font-medium transition-colors duration-100",
              tab === item.id
                ? "border-primary-500 text-link"
                : "border-transparent text-fg-muted hover:text-fg",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        {tab === "general" && (
          <>
            <FormField label="Node Adı" htmlFor="node-adi" required error={errors.label}>
              <Input
                id="node-adi"
                value={data.label}
                invalid={Boolean(errors.label)}
                onChange={(event) => update(node.id, { label: event.target.value })}
              />
            </FormField>
            <FormField
              label="Açıklama"
              htmlFor="node-aciklama"
              hint="Takım arkadaşların için not bırak"
            >
              <Textarea
                id="node-aciklama"
                value={data.description}
                onChange={(event) =>
                  update(node.id, { description: event.target.value })
                }
              />
            </FormField>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">Devre Dışı Bırak</p>
                <p className="text-caption text-fg-muted">
                  Node akıştan çıkmadan pasifleşir.
                </p>
              </div>
              <Toggle
                label="Devre Dışı Bırak"
                checked={data.disabled}
                onChange={(disabled) => update(node.id, { disabled })}
              />
            </div>
          </>
        )}
        {tab === "params" &&
          (data.category === "condition" ? (
            <ConditionBuilder
              data={data}
              errors={errors}
              onChange={(params) => update(node.id, { params })}
            />
          ) : fields.length === 0 ? (
            <p className="text-fg-muted">Bu node için ayarlanacak parametre yok.</p>
          ) : (
            fields.map((field) => (
              <ParamField
                key={field.key}
                field={field}
                value={data.params[field.key]}
                errors={errors}
                onChange={(value) =>
                  update(node.id, {
                    params: { ...data.params, [field.key]: value },
                  })
                }
              />
            ))
          ))}
        {tab === "test" && <TestTab key={node.id} data={data} />}
      </div>

      {dirty && (
        <footer className="flex items-center justify-between gap-2 border-t border-line p-3">
          <Button variant="ghost" onClick={cancelDraft}>
            İptal
          </Button>
          <Button disabled={hasError} onClick={applyDraft}>
            Uygula
          </Button>
        </footer>
      )}
    </div>
  );
}
