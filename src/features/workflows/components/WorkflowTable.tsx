"use client";

import { Copy, Play, Trash2 } from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/shared/ui/atoms/Checkbox";
import { IconButton } from "@/shared/ui/atoms/IconButton";
import { StatusPill } from "@/shared/ui/molecules/StatusPill";
import { timeAgo } from "@/shared/lib/format";
import { useRerunWorkflow } from "@/features/executions/hooks/useExecutions";
import type { Execution, Workflow } from "@/shared/domain/types";
import { successRate } from "@/features/workflows/lib/workflows";
import { useDuplicateWorkflow } from "../hooks/useWorkflows";

export function WorkflowTable({
  workflows,
  executions,
  selected,
  onSelectionChange,
  onDelete,
}: {
  workflows: Workflow[];
  executions: Execution[];
  selected: string[];
  onSelectionChange: (ids: string[]) => void;
  onDelete: (ids: string[]) => void;
}) {
  const rerun = useRerunWorkflow();
  const duplicate = useDuplicateWorkflow();
  const allSelected = workflows.length > 0 && selected.length === workflows.length;
  return (
    <div className="overflow-x-auto rounded-lg bg-surface shadow-elevation-1">
      <table className="w-full min-w-[820px] text-left">
        <thead className="border-b border-line text-fg-muted">
          <tr className="[&>th]:h-10 [&>th]:px-3 [&>th]:font-medium">
            <th className="w-10">
              <Checkbox
                aria-label="Tümünü seç"
                checked={allSelected}
                onChange={(event) =>
                  onSelectionChange(
                    event.target.checked ? workflows.map((item) => item.id) : [],
                  )
                }
              />
            </th>
            <th>Ad</th>
            <th>Durum</th>
            <th>Son Düzenleme</th>
            <th>Son Çalıştırma</th>
            <th>Başarı Oranı</th>
            <th className="w-32">
              <span className="sr-only">Aksiyonlar</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {workflows.map((workflow) => {
            const rate = successRate(workflow.id, executions);
            return (
              <tr
                key={workflow.id}
                className="group hover:bg-surface-hover [&>td]:h-12 [&>td]:px-3"
              >
                <td>
                  <Checkbox
                    aria-label={`${workflow.name} seç`}
                    checked={selected.includes(workflow.id)}
                    onChange={(event) =>
                      onSelectionChange(
                        event.target.checked
                          ? [...selected, workflow.id]
                          : selected.filter((id) => id !== workflow.id),
                      )
                    }
                  />
                </td>
                <td className="font-semibold">
                  <Link href={`/duzenleyici/${workflow.id}`} className="hover:underline">
                    {workflow.name}
                  </Link>
                </td>
                <td>
                  <StatusPill status={workflow.status} />
                </td>
                <td className="text-fg-muted">{timeAgo(workflow.updatedAt)}</td>
                <td className="text-fg-muted">{timeAgo(workflow.lastRunAt)}</td>
                <td className="text-fg-muted">{rate === null ? "—" : `%${rate}`}</td>
                <td>
                  <div className="flex justify-end gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                    <IconButton
                      label="Çalıştır"
                      size="sm"
                      tooltipSide="left"
                      onClick={() => rerun.mutate({ id: workflow.id })}
                    >
                      <Play size={16} strokeWidth={1.5} aria-hidden />
                    </IconButton>
                    <IconButton
                      label="Kopyala"
                      size="sm"
                      tooltipSide="left"
                      onClick={() => duplicate(workflow.id)}
                    >
                      <Copy size={16} strokeWidth={1.5} aria-hidden />
                    </IconButton>
                    <IconButton
                      label="Sil"
                      size="sm"
                      tooltipSide="left"
                      onClick={() => onDelete([workflow.id])}
                    >
                      <Trash2 size={16} strokeWidth={1.5} aria-hidden />
                    </IconButton>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
