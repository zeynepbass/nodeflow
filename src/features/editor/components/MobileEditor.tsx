"use client";

import { ArrowLeft, Check, CornerDownRight, Play, Plus, X } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { IconButton } from "@/shared/ui/atoms/IconButton";
import { Spinner } from "@/shared/ui/atoms/Spinner";
import { InlineNotice } from "@/shared/ui/molecules/InlineNotice";
import { SaveStatusPill } from "@/shared/ui/molecules/StatusPill";
import { cn } from "@/shared/lib/cn";
import { categories } from "@/shared/domain/nodes/catalog";
import { timeAgo } from "@/shared/lib/format";
import { hasErrors } from "@/shared/domain/nodes/validation";
import { useEditor, type FlowEdge, type FlowNode } from "@/features/editor/store/editor";
import { useWorkspace } from "@/features/workflows/store/workspace";
import { CategoryIcon } from "@/features/editor/components/CategoryIcon";
import { EditableName } from "@/features/editor/components/EditorToolbar";
import { NodePicker } from "@/features/editor/components/NodePicker";
import { NodeSettingsPanel } from "@/features/editor/components/NodeSettingsPanel";
import { nodeSummary } from "@/features/editor/lib/summary";
import { useRunner } from "@/features/editor/hooks/useRunner";

function RunIcon({ node }: { node: FlowNode }) {
  const status = node.data.runStatus;
  if (status === "running") return <Spinner size={16} className="text-link" />;
  if (status === "success") {
    return (
      <Check size={16} strokeWidth={2} aria-label="Başarılı" className="text-state-success" />
    );
  }
  if (status === "error" || hasErrors(node.data)) {
    return <X size={16} strokeWidth={2} aria-label="Hatalı" className="text-state-error" />;
  }
  return null;
}

function NodeRow({ node, lastRunAt }: { node: FlowNode; lastRunAt?: string }) {
  const selectNode = useEditor((state) => state.selectNode);
  const meta = categories[node.data.category];
  return (
    <button
      type="button"
      onClick={() => selectNode(node.id)}
      className={cn(
        "flex min-h-14 w-full items-center gap-3 rounded-lg border border-line bg-surface p-3 text-left",
        node.data.disabled && "opacity-40",
      )}
    >
      <CategoryIcon category={node.data.category} size={24} />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">
          {meta.label === node.data.label
            ? meta.label
            : `${meta.label}: ${node.data.label}`}
        </span>
        <span className="block truncate text-caption text-fg-muted">
          {nodeSummary(node.data)}
        </span>
        <span className="hidden text-caption text-fg-muted landscape:block">
          Son çalışma: {timeAgo(lastRunAt)}
        </span>
      </span>
      <RunIcon node={node} />
    </button>
  );
}

function AddBar({ nodeId, handle }: { nodeId: string; handle: string | null }) {
  const setPickerTarget = useEditor((state) => state.setPickerTarget);
  return (
    <div className="flex justify-center py-1">
      <button
        type="button"
        aria-label="Node ekle"
        onClick={() => setPickerTarget({ kind: "after", nodeId, handle })}
        className="inline-flex h-11 w-16 items-center justify-center rounded-sm text-fg-muted hover:bg-surface-hover"
      >
        <span className="inline-flex size-6 items-center justify-center rounded-full border border-line bg-surface">
          <Plus size={14} strokeWidth={1.5} aria-hidden />
        </span>
      </button>
    </div>
  );
}

type OutlineItem =
  | { kind: "ref"; id: string; label: string }
  | {
      kind: "node";
      id: string;
      node: FlowNode;
      next: OutlineItem[];
      branches: { handle: "yes" | "no"; items: OutlineItem[] }[] | null;
    };

function buildOutline(nodes: FlowNode[], edges: FlowEdge[]) {
  const seen = new Set<string>();

  const visit = (id: string): OutlineItem | null => {
    const node = nodes.find((item) => item.id === id);
    if (!node) return null;
    if (seen.has(id)) return { kind: "ref", id, label: node.data.label };
    seen.add(id);
    const outgoing = edges.filter((edge) => edge.source === id);
    const follow = (targets: FlowEdge[]) =>
      targets
        .map((edge) => visit(edge.target))
        .filter((item): item is OutlineItem => item !== null);
    if (node.data.category === "condition") {
      const handles = ["yes", "no"] as const;
      return {
        kind: "node",
        id,
        node,
        next: [],
        branches: handles.map((handle) => ({
          handle,
          items: follow(outgoing.filter((edge) => edge.sourceHandle === handle)),
        })),
      };
    }
    return { kind: "node", id, node, next: follow(outgoing), branches: null };
  };

  const targets = new Set(edges.map((edge) => edge.target));
  const start = nodes.find((node) => node.data.category === "start");
  const main = start ? visit(start.id) : null;
  const loose = nodes
    .filter((node) => !seen.has(node.id) && !targets.has(node.id))
    .map((node) => visit(node.id))
    .filter((item): item is OutlineItem => item !== null);
  return { main, loose };
}

function Chain({ item, lastRunAt }: { item: OutlineItem; lastRunAt?: string }) {
  if (item.kind === "ref") {
    return (
      <p className="flex items-center gap-2 py-2 text-caption text-fg-muted">
        <CornerDownRight size={14} strokeWidth={1.5} aria-hidden />
        {item.label} adımına bağlanır
      </p>
    );
  }

  const { node, next, branches } = item;

  if (branches) {
    return (
      <>
        <NodeRow node={node} lastRunAt={lastRunAt} />
        <div className="ml-3 border-l border-line pl-3 pt-2">
          {branches.map(({ handle, items }) => (
            <div key={handle} className="mb-2">
              <p
                className={cn(
                  "text-caption font-medium",
                  handle === "yes" ? "text-on-soft-success" : "text-on-soft-error",
                )}
              >
                {handle === "yes" ? "Evet" : "Hayır"}
              </p>
              <AddBar nodeId={node.id} handle={handle} />
              {items.map((child) => (
                <Chain key={child.id} item={child} lastRunAt={lastRunAt} />
              ))}
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      <NodeRow node={node} lastRunAt={lastRunAt} />
      {categories[node.data.category].outputs > 0 && (
        <AddBar nodeId={node.id} handle={null} />
      )}
      {next.map((child) => (
        <Chain key={child.id} item={child} lastRunAt={lastRunAt} />
      ))}
    </>
  );
}

export function MobileEditor({ onRetrySave }: { onRetrySave: () => void }) {
  const run = useRunner();
  const workflowId = useEditor((state) => state.workflowId);
  const lastRunAt = useWorkspace(
    (state) => state.workflows.find((item) => item.id === workflowId)?.lastRunAt,
  );
  const nodes = useEditor((state) => state.nodes);
  const edges = useEditor((state) => state.edges);
  const saveState = useEditor((state) => state.saveState);
  const running = useEditor((state) => state.running);
  const selected = useEditor((state) =>
    state.nodes.find((node) => node.id === state.selectedNodeId),
  );

  const { main, loose } = useMemo(() => buildOutline(nodes, edges), [nodes, edges]);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-20 flex h-14 items-center gap-1 border-b border-line bg-surface px-2">
        <Link
          href="/is-akislari"
          aria-label="Workflow'lara dön"
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-sm text-fg-muted"
        >
          <ArrowLeft size={20} strokeWidth={1.5} aria-hidden />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col items-start">
          <EditableName />
          <SaveStatusPill state={saveState} onRetry={onRetrySave} />
        </div>
        <IconButton
          label="Çalıştır"
          tooltip={false}
          disabled={running}
          className="size-11 bg-action text-white hover:bg-action-hover hover:text-white"
          onClick={() => run("Manuel")}
        >
          {running ? (
            <Spinner size={20} />
          ) : (
            <Play size={20} strokeWidth={1.5} aria-hidden />
          )}
        </IconButton>
      </header>

      <main data-testid="akis-listesi" className="flex-1 p-4">
        {main && <Chain item={main} lastRunAt={lastRunAt} />}
        {loose.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 text-caption font-medium text-fg-muted">
              Bağlantısız node&apos;lar
            </h2>
            <div className="flex flex-col gap-2">
              {loose.map((item) => (
                <Chain key={item.id} item={item} lastRunAt={lastRunAt} />
              ))}
            </div>
          </section>
        )}
        <InlineNotice className="mt-6">
          Akışı yeniden düzenlemek için masaüstünü kullan.
        </InlineNotice>
      </main>

      {selected && (
        <div
          role="dialog"
          aria-label={`${selected.data.label} ayarları`}
          className="fixed inset-0 z-30 flex flex-col bg-surface"
        >
          <NodeSettingsPanel key={selected.id} node={selected} fullScreen />
        </div>
      )}
      <NodePicker />
    </div>
  );
}
