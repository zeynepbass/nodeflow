"use client";

import { ArrowLeft, History, Play, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button, buttonClass } from "@/components/atoms/Button";
import { Select } from "@/components/atoms/Select";
import { EmptyState } from "@/components/molecules/EmptyState";
import { StatusPill } from "@/components/molecules/StatusPill";
import { cn } from "@/lib/cn";
import { formatDateTime, formatDuration, timeAgo } from "@/lib/format";
import { rerunWorkflow } from "@/lib/nodes/execute";
import { useWorkspace } from "@/lib/stores/workspace";
import type { Execution } from "@/lib/types";
import { ExecutionLog } from "./ExecutionLog";
import { NodeStrip } from "./NodeStrip";

type StatusFilter = "all" | "success" | "error";
type RangeFilter = "all" | "today" | "week";

function inRange(iso: string, range: RangeFilter) {
  if (range === "all") return true;
  const start =
    range === "today"
      ? new Date().setHours(0, 0, 0, 0)
      : Date.now() - 7 * 86400000;
  return new Date(iso).getTime() >= start;
}

function ExecutionDetail({ execution }: { execution: Execution }) {
  const router = useRouter();
  const [rerunning, setRerunning] = useState(false);
  const [highlight, setHighlight] = useState<string | null>(null);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {execution.status === "running" && (
        <div className="h-0.5 overflow-hidden rounded-full bg-line">
          <div className="h-full w-1/3 animate-progress bg-action" />
        </div>
      )}
      <section className="flex flex-wrap items-start justify-between gap-4 rounded-lg bg-surface p-5 shadow-elevation-1">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-h2">{execution.workflowName}</h2>
            <StatusPill status={execution.status} large />
          </div>
          <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-caption text-fg-muted">
            <div className="flex gap-1">
              <dt>Başlangıç:</dt>
              <dd>{formatDateTime(execution.startedAt)}</dd>
            </div>
            {execution.finishedAt && (
              <div className="flex gap-1">
                <dt>Bitiş:</dt>
                <dd>{formatDateTime(execution.finishedAt)}</dd>
              </div>
            )}
            <div className="flex gap-1">
              <dt>Süre:</dt>
              <dd>{formatDuration(execution.durationMs)}</dd>
            </div>
          </dl>
        </div>
        <Button
          variant="secondary"
          loading={rerunning}
          onClick={async () => {
            setRerunning(true);
            const result = await rerunWorkflow(execution.workflowId);
            setRerunning(false);
            if (result) router.push(`/calistirmalar/${result.id}`);
          }}
        >
          <RotateCcw size={16} strokeWidth={1.5} aria-hidden />
          Tekrar Çalıştır
        </Button>
      </section>
      <NodeStrip nodes={execution.nodes} onSelect={setHighlight} />
      <ExecutionLog execution={execution} highlightNodeId={highlight} />
    </div>
  );
}

export function ExecutionsView({ selectedId }: { selectedId?: string }) {
  const router = useRouter();
  const executions = useWorkspace((state) => state.executions);
  const workflows = useWorkspace((state) => state.workflows);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [range, setRange] = useState<RangeFilter>("all");

  const list = useMemo(
    () =>
      executions.filter(
        (item) =>
          (status === "all" || item.status === status) &&
          inRange(item.startedAt, range),
      ),
    [executions, range, status],
  );

  if (executions.length === 0) {
    const first = workflows[0];
    return (
      <EmptyState
        icon={History}
        title="Bu workflow henüz çalıştırılmadı."
        action={
          first ? (
            <Button
              onClick={async () => {
                const result = await rerunWorkflow(first.id);
                if (result) router.push(`/calistirmalar/${result.id}`);
              }}
            >
              <Play size={16} strokeWidth={1.5} aria-hidden />
              Şimdi Çalıştır
            </Button>
          ) : (
            <Link href="/is-akislari" className={buttonClass()}>
              Workflow&apos;lara Git
            </Link>
          )
        }
      />
    );
  }

  const selected = selectedId
    ? executions.find((item) => item.id === selectedId)
    : list[0];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-h1">Çalıştırmalar</h1>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section className={cn("flex min-w-0 flex-col gap-3", selectedId && "max-lg:hidden")}>
          <div className="grid grid-cols-2 gap-2">
            <Select
              aria-label="Durum"
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
              options={[
                { value: "all", label: "Durum: Tümü" },
                { value: "success", label: "Başarılı" },
                { value: "error", label: "Hatalı" },
              ]}
            />
            <Select
              aria-label="Tarih aralığı"
              value={range}
              onChange={(event) => setRange(event.target.value as RangeFilter)}
              options={[
                { value: "all", label: "Tüm zamanlar" },
                { value: "today", label: "Bugün" },
                { value: "week", label: "Son 7 gün" },
              ]}
            />
          </div>
          {list.length === 0 ? (
            <p className="py-8 text-center text-fg-muted">
              Bu filtrelerle eşleşen çalıştırma yok.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {list.map((item) => {
                const active = item.id === selected?.id;
                const ran = item.nodes.filter(
                  (node) => node.status === "success" || node.status === "error",
                ).length;
                return (
                  <li key={item.id}>
                    <Link
                      href={`/calistirmalar/${item.id}`}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "block rounded-md border bg-surface p-3 transition-colors duration-100 hover:border-primary-200",
                        active ? "border-primary-500" : "border-transparent shadow-elevation-1",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold">{item.workflowName}</span>
                        <StatusPill status={item.status} />
                      </div>
                      <p className="mt-1 text-caption text-fg-muted">
                        {timeAgo(item.startedAt)} · {item.trigger} ·{" "}
                        {formatDuration(item.durationMs)} · {ran} node çalıştı
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className={cn("min-w-0", !selectedId && "max-lg:hidden")}>
          {selectedId && (
            <Link
              href="/calistirmalar"
              className="mb-3 inline-flex h-11 items-center gap-1 font-medium text-fg-muted lg:hidden"
            >
              <ArrowLeft size={20} strokeWidth={1.5} aria-hidden />
              Çalıştırmalar
            </Link>
          )}
          {selected ? (
            <ExecutionDetail key={selected.id} execution={selected} />
          ) : (
            <p className="py-8 text-center text-fg-muted">
              Çalıştırma kaydı bulunamadı.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
