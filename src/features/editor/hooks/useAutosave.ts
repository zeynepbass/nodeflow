import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { workflowsApi } from "@/features/workflows/api/workflows-api";
import { queryKeys } from "@/shared/api/query-keys";
import { useEditor } from "../store/editor";

export function useAutosave() {
  const client = useQueryClient();
  const revision = useEditor((state) => state.revision);

  const save = useCallback(async () => {
    const editor = useEditor.getState();
    if (!editor.workflowId) return;
    const startedAt = editor.revision;
    editor.setSaveState("saving");
    try {
      const saved = await workflowsApi.saveFlow(editor.workflowId, editor.snapshotFlow());
      client.setQueryData(queryKeys.workflow(saved.id), saved);
      client.invalidateQueries({ queryKey: queryKeys.workflows, exact: true });
      if (useEditor.getState().revision === startedAt) {
        useEditor.getState().setSaveState("saved");
      }
    } catch {
      useEditor.getState().setSaveState("error");
    }
  }, [client]);

  useEffect(() => {
    if (revision === 0) return;
    useEditor.getState().setSaveState("saving");
    const timer = window.setTimeout(save, 500);
    return () => window.clearTimeout(timer);
  }, [revision, save]);

  useEffect(
    () => () => {
      const editor = useEditor.getState();
      editor.applyDraft();
      if (useEditor.getState().saveState === "saving") save();
    },
    [save],
  );

  return save;
}
