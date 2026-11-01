"use client";

import { ArrowLeft, Check, CornerDownRight, Play, Plus, X } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { IconButton } from "@/components/atoms/IconButton";
import { Spinner } from "@/components/atoms/Spinner";
import { InlineNotice } from "@/components/molecules/InlineNotice";
import { SaveStatusPill } from "@/components/molecules/StatusPill";
import { cn } from "@/lib/cn";
import { categories } from "@/lib/nodes/catalog";
import { timeAgo } from "@/lib/format";
import { hasErrors } from "@/lib/nodes/validation";
import { useEditor, type FlowNode } from "@/lib/stores/editor";
import { useWorkspace } from "@/lib/stores/workspace";
import { CategoryIcon } from "./CategoryIcon";
import { EditableName } from "./EditorToolbar";
import { NodePicker } from "./NodePicker";
import { NodeSettingsPanel } from "./NodeSettingsPanel";
import { nodeSummary } from "./summary";
import { useRunner } from "./useRunner";

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

function Chain({
  nodeId,
  visited,
  lastRunAt,
}: {
  nodeId: string;
  visited: Set<string>;
  lastRunAt?: string;
}) {
  const nodes = useEditor((state) => state.nodes);
  const edges = useEditor((state) => state.edges);
  const node = nodes.find((item) => item.id === nodeId);
  if (!node) return null;

  if (visited.has(nodeId)) {
    return (
      <p className="flex items-center gap-2 py-2 text-caption text-fg-muted">
        <CornerDownRight size={14} strokeWidth={1.5} aria-hidden />
        {node.data.label} adımına bağlanır
      </p>
    );
  }
  visited.add(nodeId);

  const outgoing = edges.filter((edge) => edge.source === nodeId);
  const meta = categories[node.data.category];

  if (node.data.category === "condition") {
    return (
      <>
        <NodeRow node={node} lastRunAt={lastRunAt} />
        <div className="ml-3 border-l border-line pl-3 pt-2">
          {(["yes", "no"] as const).map((handle) => {
            const branch = outgoing.filter((edge) => edge.sourceHandle === handle);
            return (
              <div key={handle} className="mb-2">
                <p
                  className={cn(
                    "text-caption font-medium",
                    handle === "yes" ? "text-on-soft-success" : "text-on-soft-error",
                  )}
                >
                  {handle === "yes" ? "Evet" : "Hayır"}
                </p>
                <AddBar nodeId={nodeId} handle={handle} />
                {branch.map((edge) => (
                  <Chain
                    key={edge.id}
                    nodeId={edge.target}
                    visited={visited}
                    lastRunAt={lastRunAt}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <>
      <NodeRow node={node} lastRunAt={lastRunAt} />
      {meta.outputs > 0 && <AddBar nodeId={nodeId} handle={null} />}
      {outgoing.map((edge) => (
        <Fragment key={edge.id}>
          <Chain nodeId={edge.target} visited={visited} lastRunAt={lastRunAt} />
        </Fragment>
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

  const visited = new Set<string>();
  const targets = new Set(edges.map((edge) => edge.target));
  const start = nodes.find((node) => node.data.category === "start");
  const roots = nodes.filter(
    (node) => node.id !== start?.id && !targets.has(node.id),
  );

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
        {start && <Chain nodeId={start.id} visited={visited} lastRunAt={lastRunAt} />}
        {roots.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-2 text-caption font-medium text-fg-muted">
              Bağlantısız node&apos;lar
            </h2>
            <div className="flex flex-col gap-2">
              {roots.map((node) => (
                <Chain key={node.id} nodeId={node.id} visited={visited} lastRunAt={lastRunAt} />
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
