"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useExecuteFlow } from "@/features/executions/hooks/useExecutions";
import { showToast } from "@/shared/stores/toast";
import { useEditor } from "../store/editor";

export function useRunner(save: () => Promise<void>) {
  const router = useRouter();
  const execute = useExecuteFlow();

  return useCallback(
    async (trigger: string) => {
      const editor = useEditor.getState();
      if (editor.running || !editor.workflowId) return;
      editor.applyDraft();
      editor.clearRunStates();
      editor.setRunState({ running: true });
      await save();
      const { workflowId, setNodeRun, setRunState, snapshotFlow } = useEditor.getState();
      const { nodes, edges } = snapshotFlow();

      try {
        const result = await execute({
          workflowId: workflowId!,
          nodes,
          edges,
          trigger,
          hooks: {
            onNodeStart: (id) =>
              setNodeRun(id, { runStatus: "running", runError: undefined }),
            onNodeEnd: (id, run) => {
              if (!run) {
                setNodeRun(id, { runStatus: undefined, runError: undefined });
              } else if (run.ok) {
                setNodeRun(id, { runStatus: "success", runError: undefined });
                window.setTimeout(() => {
                  const current = useEditor
                    .getState()
                    .nodes.find((node) => node.id === id);
                  if (current?.data.runStatus === "success") {
                    setNodeRun(id, { runStatus: undefined, runError: undefined });
                  }
                }, 3000);
              } else {
                setNodeRun(id, { runStatus: "error", runError: run.error });
              }
            },
            onEdge: (activeEdgeId) => setRunState({ activeEdgeId }),
          },
        });
        showToast({
          variant: result.status === "success" ? "success" : "error",
          message:
            result.status === "success"
              ? "Workflow başarıyla çalıştı."
              : "Workflow hatayla sonlandı. Hatalı node'a tıkla.",
          actionLabel: "Detay",
          onAction: () => router.push(`/calistirmalar/${result.id}`),
        });
      } catch (error) {
        showToast({
          variant: "error",
          message: error instanceof Error ? error.message : "Çalıştırma başlatılamadı.",
        });
      } finally {
        setRunState({ running: false, activeEdgeId: null });
      }
    },
    [execute, router, save],
  );
}
