"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { executeFlow } from "@/lib/nodes/execute";
import { useAuth } from "@/lib/stores/auth";
import { toStoredEdge, toStoredNode, useEditor } from "@/lib/stores/editor";
import { showToast } from "@/lib/stores/toast";
import { useWorkspace } from "@/lib/stores/workspace";

export function useRunner() {
  const router = useRouter();

  return useCallback(
    async (trigger: string) => {
      const editor = useEditor.getState();
      if (editor.running || !editor.workflowId) return;
      editor.applyDraft();
      editor.clearRunStates();
      editor.flush();
      editor.setRunState({ running: true });
      const { name, nodes, edges, workflowId, setNodeRun, setRunState } =
        useEditor.getState();

      const result = await executeFlow({
        workflowId: workflowId!,
        workflowName: name,
        nodes: nodes.map(toStoredNode),
        edges: edges.map(toStoredEdge),
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

      setRunState({ running: false, activeEdgeId: null });
      const user = useAuth.getState().user;
      if (user) useWorkspace.getState().logActivity(user.name, "çalıştırdı", name);
      showToast({
        variant: result.status === "success" ? "success" : "error",
        message:
          result.status === "success"
            ? "Workflow başarıyla çalıştı."
            : "Workflow hatayla sonlandı. Hatalı node'a tıkla.",
        actionLabel: "Detay",
        onAction: () => router.push(`/calistirmalar/${result.id}`),
      });
    },
    [router],
  );
}
