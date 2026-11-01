"use client";

import { Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { IconButton } from "@/shared/ui/atoms/IconButton";
import { Toggle } from "@/shared/ui/atoms/Toggle";
import { cn } from "@/shared/lib/cn";
import { formatClock } from "@/shared/lib/format";
import { showToast } from "@/shared/stores/toast";
import type { Execution } from "@/shared/domain/types";

export function ExecutionLog({
  execution,
  highlightNodeId,
}: {
  execution: Execution;
  highlightNodeId: string | null;
}) {
  const [errorsOnly, setErrorsOnly] = useState(false);
  const lines = errorsOnly
    ? execution.logs.filter((line) => line.level === "error")
    : execution.logs;

  useEffect(() => {
    if (!highlightNodeId) return;
    document
      .querySelector(`[data-log-node="${highlightNodeId}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [highlightNodeId]);

  const text = (line: (typeof lines)[number]) =>
    `${formatClock(line.at)}  ${line.level === "error" ? "✕" : "▶"} ${line.message}`;

  return (
    <section className="rounded-lg bg-surface shadow-elevation-1">
      <div className="flex items-center gap-3 border-b border-line px-4 py-2">
        <h3 className="flex-1 text-h3">Log</h3>
        <label className="flex items-center gap-2 text-caption text-fg-muted">
          Sadece hataları göster
          <Toggle
            label="Sadece hataları göster"
            checked={errorsOnly}
            onChange={setErrorsOnly}
          />
        </label>
        <IconButton
          label="Logu kopyala"
          size="sm"
          tooltipSide="left"
          onClick={async () => {
            await navigator.clipboard.writeText(lines.map(text).join("\n"));
            showToast({ message: "Log kopyalandı." });
          }}
        >
          <Copy size={16} strokeWidth={1.5} aria-hidden />
        </IconButton>
      </div>
      <div className="max-h-96 overflow-auto p-4 font-mono text-code">
        {lines.length === 0 && <p className="text-fg-muted">Gösterilecek satır yok.</p>}
        {lines.map((line) => (
          <p
            key={line.id}
            data-log-node={line.nodeId}
            className={cn(
              "whitespace-pre-wrap rounded-xs px-1 transition-colors duration-150",
              line.level === "error" && "text-state-error",
              line.nodeId === highlightNodeId && "bg-soft-primary",
            )}
          >
            {text(line)}
          </p>
        ))}
      </div>
    </section>
  );
}
