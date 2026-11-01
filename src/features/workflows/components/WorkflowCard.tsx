"use client";

import { Boxes } from "lucide-react";
import Link from "next/link";
import { StatusPill } from "@/shared/ui/molecules/StatusPill";
import { timeAgo } from "@/shared/lib/format";
import type { Workflow } from "@/shared/domain/types";
import { WorkflowActions } from "@/features/workflows/components/WorkflowActions";

export function WorkflowCard({
  workflow,
  rate,
  onDelete,
}: {
  workflow: Workflow;
  rate: number | null;
  onDelete: () => void;
}) {
  return (
    <article className="group relative flex min-h-40 flex-col rounded-lg border border-transparent bg-surface p-5 shadow-elevation-1 transition-[box-shadow,border-color] duration-150 hover:border-primary-200 hover:shadow-elevation-2">
      <div className="flex items-start justify-between gap-2">
        <h2 className="min-w-0 text-h3">
          <Link
            href={`/duzenleyici/${workflow.id}`}
            className="line-clamp-2 after:absolute after:inset-0 after:rounded-lg"
          >
            {workflow.name}
          </Link>
        </h2>
        <WorkflowActions
          workflow={workflow}
          onDelete={onDelete}
          className="relative z-10 -mr-1 -mt-1 opacity-100 transition-opacity lg:opacity-40 lg:group-hover:opacity-100"
        />
      </div>
      <div className="mt-2">
        <StatusPill status={workflow.status} />
      </div>
      <p className="mt-2 truncate text-caption text-fg-muted">
        {workflow.description || "Açıklama yok"}
      </p>
      <div className="mt-auto flex items-center gap-3 pt-4 text-caption text-fg-muted">
        <span className="inline-flex items-center gap-1">
          <Boxes size={14} strokeWidth={1.5} aria-hidden />
          {workflow.nodes.length}
        </span>
        <span className="flex-1 truncate">{timeAgo(workflow.lastRunAt)}</span>
        {rate !== null && (
          <span className="inline-flex items-center gap-1" title={`Başarı oranı %${rate}`}>
            <span className="h-1 w-12 overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full bg-state-success"
                style={{ width: `${rate}%` }}
              />
            </span>
            %{rate}
          </span>
        )}
      </div>
    </article>
  );
}
