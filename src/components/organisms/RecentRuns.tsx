"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { IconButton } from "@/components/atoms/IconButton";
import { TextLink } from "@/components/atoms/TextLink";
import { StatusPill } from "@/components/molecules/StatusPill";
import { timeAgo } from "@/lib/format";
import { rerunWorkflow } from "@/lib/nodes/execute";
import { showToast } from "@/lib/stores/toast";
import type { Execution } from "@/lib/types";

export function RecentRuns({ executions }: { executions: Execution[] }) {
  return (
    <div className="rounded-xl bg-surface p-5 shadow-elevation-1">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-h2">Son Çalışmalar</h2>
        <TextLink href="/calistirmalar">Tümünü Gör</TextLink>
      </div>
      {executions.length === 0 ? (
        <p className="py-6 text-center text-fg-muted">Henüz çalıştırma yok.</p>
      ) : (
        <ul className="divide-y divide-line">
          {executions.map((item) => (
            <li key={item.id} className="group flex items-center gap-3 py-2">
              <StatusPill status={item.status} />
              <Link
                href={`/duzenleyici/${item.workflowId}`}
                className="min-w-0 flex-1 truncate font-medium hover:underline"
              >
                {item.workflowName}
              </Link>
              <span className="hidden text-caption text-fg-muted sm:inline">
                {item.trigger}
              </span>
              <span className="whitespace-nowrap text-caption text-fg-muted">
                {timeAgo(item.startedAt)}
              </span>
              <IconButton
                label="Tekrar Çalıştır"
                tooltipSide="left"
                className="opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100 lg:focus-visible:opacity-100"
                onClick={async () => {
                  const result = await rerunWorkflow(item.workflowId);
                  if (!result) return;
                  showToast({
                    variant: result.status === "success" ? "success" : "error",
                    message:
                      result.status === "success"
                        ? `${item.workflowName} başarıyla çalıştı.`
                        : `${item.workflowName} hatayla sonlandı.`,
                  });
                }}
              >
                <RotateCcw size={16} strokeWidth={1.5} aria-hidden />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
