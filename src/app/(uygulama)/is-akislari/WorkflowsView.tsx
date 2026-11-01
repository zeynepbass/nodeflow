"use client";

import { LayoutGrid, List, Plus, SearchX, Workflow as WorkflowIcon, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Select } from "@/components/atoms/Select";
import { EmptyState } from "@/components/molecules/EmptyState";
import { Modal } from "@/components/molecules/Modal";
import { SearchBar } from "@/components/molecules/SearchBar";
import { Segmented } from "@/components/molecules/Segmented";
import { WorkflowCard } from "@/components/organisms/WorkflowCard";
import { WorkflowTable } from "@/components/organisms/WorkflowTable";
import { showToast } from "@/lib/stores/toast";
import { useUi } from "@/lib/stores/ui";
import { useWorkspace } from "@/lib/stores/workspace";
import type { Workflow, WorkflowStatus } from "@/lib/types";
import { downloadWorkflows, successRate } from "@/lib/workflows";

type SortKey = "updated" | "name" | "created" | "rate";

const statusLabels: Record<WorkflowStatus, string> = {
  active: "Aktif",
  draft: "Taslak",
  stopped: "Durduruldu",
};

const normalize = (value: string) => value.toLocaleLowerCase("tr-TR");

export function WorkflowsView() {
  const workflows = useWorkspace((state) => state.workflows);
  const executions = useWorkspace((state) => state.executions);
  const removeWorkflows = useWorkspace((state) => state.removeWorkflows);
  const openNew = useUi((state) => state.setNewWorkflowOpen);

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [status, setStatus] = useState<WorkflowStatus | "all">("all");
  const [tag, setTag] = useState("all");
  const [sort, setSort] = useState<SortKey>("updated");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [selected, setSelected] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query), 200);
    return () => window.clearTimeout(timer);
  }, [query]);

  const tags = useMemo(
    () => [...new Set(workflows.flatMap((item) => item.tags))].sort(),
    [workflows],
  );

  const visible = useMemo(() => {
    const term = normalize(debounced.trim());
    const rate = (item: Workflow) => successRate(item.id, executions) ?? -1;
    const sorters: Record<SortKey, (a: Workflow, b: Workflow) => number> = {
      updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
      name: (a, b) => a.name.localeCompare(b.name, "tr"),
      created: (a, b) => b.createdAt.localeCompare(a.createdAt),
      rate: (a, b) => rate(b) - rate(a),
    };
    return workflows
      .filter(
        (item) =>
          (!term ||
            normalize(item.name).includes(term) ||
            normalize(item.description).includes(term)) &&
          (status === "all" || item.status === status) &&
          (tag === "all" || item.tags.includes(tag)),
      )
      .sort(sorters[sort]);
  }, [debounced, executions, sort, status, tag, workflows]);

  const deletingNames = workflows.filter((item) => pendingDelete.includes(item.id));

  const confirmDelete = () => {
    removeWorkflows(pendingDelete);
    setSelected((value) => value.filter((id) => !pendingDelete.includes(id)));
    showToast({
      message:
        pendingDelete.length === 1
          ? "Workflow silindi."
          : `${pendingDelete.length} workflow silindi.`,
    });
    setPendingDelete([]);
  };

  const chips = [
    status !== "all" && { label: statusLabels[status], clear: () => setStatus("all") },
    tag !== "all" && { label: tag, clear: () => setTag("all") },
  ].filter(Boolean) as { label: string; clear: () => void }[];

  if (workflows.length === 0) {
    return (
      <EmptyState
        icon={WorkflowIcon}
        title="Henüz bir workflow'un yok"
        description="İlk otomasyonunu 2 dakikada kur."
        action={
          <Button onClick={() => openNew(true)}>
            <Plus size={16} strokeWidth={1.5} aria-hidden />
            İlk Workflow&apos;unu Oluştur
          </Button>
        }
      />
    );
  }

  const showBulkBar = view === "list" && selected.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-h1">Workflow&apos;lar</h1>

      {showBulkBar ? (
        <div className="flex min-h-14 flex-wrap items-center gap-3 rounded-md bg-soft-primary px-4 py-2 text-on-soft-primary">
          <span className="flex-1 font-medium">{selected.length} seçili</span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              downloadWorkflows(workflows.filter((item) => selected.includes(item.id)))
            }
          >
            Dışa Aktar
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setPendingDelete(selected)}>
            Sil
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
            Seçimi Kaldır
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <SearchBar
            aria-label="Workflow ara"
            placeholder="Workflow ara…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full lg:w-72"
          />
          <Select
            aria-label="Durum"
            value={status}
            className="min-w-32 flex-1 sm:flex-none"
            onChange={(event) => setStatus(event.target.value as WorkflowStatus | "all")}
            options={[
              { value: "all", label: "Durum: Tümü" },
              ...Object.entries(statusLabels).map(([value, label]) => ({ value, label })),
            ]}
          />
          <Select
            aria-label="Etiket"
            value={tag}
            className="min-w-32 flex-1 sm:flex-none"
            onChange={(event) => setTag(event.target.value)}
            options={[
              { value: "all", label: "Etiket: Tümü" },
              ...tags.map((value) => ({ value, label: value })),
            ]}
          />
          <Select
            aria-label="Sırala"
            value={sort}
            className="min-w-40 flex-1 sm:flex-none"
            onChange={(event) => setSort(event.target.value as SortKey)}
            options={[
              { value: "updated", label: "Son Düzenlenme" },
              { value: "name", label: "Ad (A-Z)" },
              { value: "created", label: "Oluşturulma Tarihi" },
              { value: "rate", label: "Başarı Oranı" },
            ]}
          />
          <div className="ml-auto flex items-center gap-2">
            <Segmented
              label="Görünüm"
              value={view}
              onChange={setView}
              className="max-md:hidden"
              options={[
                {
                  value: "grid",
                  ariaLabel: "Grid görünümü",
                  label: <LayoutGrid size={16} strokeWidth={1.5} aria-hidden />,
                },
                {
                  value: "list",
                  ariaLabel: "Liste görünümü",
                  label: <List size={16} strokeWidth={1.5} aria-hidden />,
                },
              ]}
            />
            <Button onClick={() => openNew(true)}>
              <Plus size={16} strokeWidth={1.5} aria-hidden />
              Yeni Workflow
            </Button>
          </div>
        </div>
      )}

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.clear}
              aria-label={`${chip.label} filtresini kaldır`}
              className="inline-flex h-8 items-center gap-1 rounded-full bg-soft-primary px-3 text-caption font-medium text-on-soft-primary"
            >
              {chip.label}
              <X size={14} strokeWidth={1.5} aria-hidden />
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={
            debounced.trim()
              ? `‘${debounced.trim()}’ ile eşleşen workflow bulunamadı`
              : "Bu filtrelerle eşleşen workflow bulunamadı"
          }
        />
      ) : (
        <>
          <div
            className={
              view === "list"
                ? "md:hidden"
                : "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            }
          >
            {view === "list" ? (
              <div className="grid grid-cols-1 gap-6">
                {visible.map((item) => (
                  <WorkflowCard
                    key={item.id}
                    workflow={item}
                    rate={successRate(item.id, executions)}
                    onDelete={() => setPendingDelete([item.id])}
                  />
                ))}
              </div>
            ) : (
              visible.map((item) => (
                <WorkflowCard
                  key={item.id}
                  workflow={item}
                  rate={successRate(item.id, executions)}
                  onDelete={() => setPendingDelete([item.id])}
                />
              ))
            )}
          </div>
          {view === "list" && (
            <div className="max-md:hidden">
              <WorkflowTable
                workflows={visible}
                executions={executions}
                selected={selected}
                onSelectionChange={setSelected}
                onDelete={setPendingDelete}
              />
            </div>
          )}
        </>
      )}

      <Modal
        open={pendingDelete.length > 0}
        onClose={() => setPendingDelete([])}
        title="Workflow'u sil"
        footer={
          <>
            <Button variant="secondary" autoFocus onClick={() => setPendingDelete([])}>
              İptal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Sil
            </Button>
          </>
        }
      >
        <p className="text-fg-muted">
          <strong className="font-semibold text-fg">
            {deletingNames.length === 1
              ? deletingNames[0].name
              : `${deletingNames.length} workflow`}
          </strong>
          &apos;nı silmek istediğine emin misin? Bu işlem geri alınamaz.
        </p>
      </Modal>
    </div>
  );
}
