"use client";

import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { SearchX } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/atoms/Button";
import { EmptyState } from "@/components/molecules/EmptyState";
import { AuthGate } from "@/components/organisms/AppShell";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { useEditor } from "@/lib/stores/editor";
import { showToast } from "@/lib/stores/toast";
import { useWorkspace } from "@/lib/stores/workspace";
import { Canvas } from "./Canvas";
import { EditorToolbar } from "./EditorToolbar";
import { NodeLibrary } from "./NodeLibrary";
import { NodePicker } from "./NodePicker";
import { RightPanel } from "./RightPanel";
import { ScheduleModal } from "./ScheduleModal";
import { useRunner } from "./useRunner";

function useAutosave() {
  const revision = useEditor((state) => state.revision);

  const save = useCallback(() => {
    const { flush, setSaveState } = useEditor.getState();
    try {
      flush();
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }, []);

  useEffect(() => {
    if (revision === 0) return;
    useEditor.getState().setSaveState("saving");
    const timer = window.setTimeout(save, 500);
    return () => window.clearTimeout(timer);
  }, [revision, save]);

  useEffect(
    () => () => {
      const { applyDraft, saveState } = useEditor.getState();
      applyDraft();
      if (saveState === "saving" || useEditor.getState().saveState === "saving") {
        useEditor.getState().flush();
      }
    },
    [],
  );

  return save;
}

function useEditorShortcuts(save: () => void) {
  const flow = useReactFlow();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const editor = useEditor.getState();
      if (!(event.metaKey || event.ctrlKey)) return;
      const key = event.key.toLowerCase();
      if (key === "s") {
        event.preventDefault();
        editor.applyDraft();
        save();
        showToast({ message: "Workflow kaydedildi." });
        return;
      }
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select")) return;
      if (key === "z") {
        event.preventDefault();
        if (event.shiftKey) editor.redo();
        else editor.undo();
      }
      if (key === "d") {
        event.preventDefault();
        editor.duplicateNodes(
          flow.getNodes().filter((node) => node.selected).map((node) => node.id),
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flow, save]);
}

function DesktopEditor() {
  const save = useAutosave();
  useEditorShortcuts(save);
  const isTablet = useMediaQuery("(max-width: 1023px)");
  const run = useRunner();
  const selectedNodeId = useEditor((state) => state.selectedNodeId);
  const [libraryCollapsed, setLibraryCollapsed] = useState(false);
  const [libraryOverlay, setLibraryOverlay] = useState(false);
  const [settingsCollapsed, setSettingsCollapsed] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  useEffect(() => {
    if (!selectedNodeId) return;
    const timer = window.setTimeout(() => {
      setSettingsCollapsed(false);
      setLibraryOverlay(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selectedNodeId]);

  return (
    <div className="flex h-dvh flex-col">
      <EditorToolbar
        onRun={() => run("Manuel")}
        onTestRun={() => run("Test")}
        onSchedule={() => setScheduleOpen(true)}
        onToggleLibrary={() => setLibraryOverlay((value) => !value)}
        onRetrySave={save}
      />
      <div className="relative flex min-h-0 flex-1">
        {!isTablet && (
          <NodeLibrary
            collapsed={libraryCollapsed}
            onCollapsedChange={setLibraryCollapsed}
          />
        )}
        {isTablet && libraryOverlay && (
          <>
            <button
              type="button"
              aria-label="Kütüphaneyi kapat"
              onClick={() => setLibraryOverlay(false)}
              className="absolute inset-0 z-10 bg-[rgb(14_15_20/0.3)]"
            />
            <NodeLibrary
              overlay
              collapsed={false}
              onCollapsedChange={() => undefined}
              onClose={() => setLibraryOverlay(false)}
            />
          </>
        )}
        <Canvas />
        <RightPanel
          overlay={isTablet}
          collapsed={settingsCollapsed}
          onCollapsedChange={setSettingsCollapsed}
        />
      </div>
      <NodePicker />
      <ScheduleModal open={scheduleOpen} onClose={() => setScheduleOpen(false)} />
    </div>
  );
}

function EditorContent({ id }: { id: string }) {
  const workflow = useWorkspace((state) =>
    state.workflows.find((item) => item.id === id),
  );
  const loadedId = useEditor((state) => state.workflowId);
  const load = useEditor((state) => state.load);
  const loadedOnce = useRef(false);

  useEffect(() => {
    if (workflow && !loadedOnce.current) {
      loadedOnce.current = true;
      load(workflow);
    }
  }, [load, workflow]);

  if (!workflow) {
    return (
      <EmptyState
        icon={SearchX}
        title="Workflow bulunamadı"
        description="Bu workflow silinmiş veya hiç oluşturulmamış olabilir."
        action={
          <Link href="/is-akislari" className={buttonClass()}>
            Workflow&apos;lara Dön
          </Link>
        }
      />
    );
  }
  if (loadedId !== id) return null;

  return (
    <ReactFlowProvider>
      <DesktopEditor />
    </ReactFlowProvider>
  );
}

export function EditorScreen({ id }: { id: string }) {
  return (
    <AuthGate>
      <EditorContent id={id} />
    </AuthGate>
  );
}
