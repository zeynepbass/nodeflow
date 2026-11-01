"use client";

import { Ban, Check, X } from "lucide-react";
import { Fragment } from "react";
import { Tooltip } from "@/shared/ui/atoms/Tooltip";
import { cn } from "@/shared/lib/cn";
import type { NodeResult } from "@/shared/domain/types";

const styles: Record<NodeResult["status"], string> = {
  success: "bg-soft-success text-on-soft-success",
  error: "bg-soft-error text-on-soft-error",
  waiting: "bg-soft-neutral text-on-soft-neutral",
  running: "bg-soft-primary text-on-soft-primary animate-node-pulse",
  skipped: "bg-soft-neutral text-on-soft-neutral",
};

const labels: Record<NodeResult["status"], string> = {
  success: "Başarılı",
  error: "Hatalı",
  waiting: "Bekliyor",
  running: "Çalışıyor",
  skipped: "Atlandı",
};

function StatusIcon({ status }: { status: NodeResult["status"] }) {
  if (status === "success") return <Check size={16} strokeWidth={2} aria-hidden />;
  if (status === "error") return <X size={16} strokeWidth={2} aria-hidden />;
  if (status === "skipped") return <Ban size={16} strokeWidth={1.5} aria-hidden />;
  return (
    <span aria-hidden className="size-3 rounded-full border-[1.5px] border-current" />
  );
}

export function NodeStrip({
  nodes,
  onSelect,
}: {
  nodes: NodeResult[];
  onSelect: (nodeId: string) => void;
}) {
  return (
    <section aria-label="Node durumları" className="overflow-x-auto pb-2 pt-10">
      <ol className="flex w-max items-center">
        {nodes.map((node, index) => (
          <Fragment key={node.nodeId}>
            {index > 0 && <span aria-hidden className="h-px w-6 bg-line" />}
            <li>
              <Tooltip
                content={node.error ?? `${node.label} · ${labels[node.status]}`}
                side="top"
              >
                <button
                  type="button"
                  aria-label={`${node.label}: ${labels[node.status]}`}
                  onClick={() => onSelect(node.nodeId)}
                  className={cn(
                    "inline-flex size-10 items-center justify-center rounded-md",
                    styles[node.status],
                  )}
                >
                  <StatusIcon status={node.status} />
                </button>
              </Tooltip>
            </li>
          </Fragment>
        ))}
      </ol>
    </section>
  );
}
