"use client";

import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import { SearchX } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { buttonClass } from "@/shared/ui/atoms/Button";
import { EmptyState } from "@/shared/ui/molecules/EmptyState";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { useEditor } from "@/features/editor/store/editor";
import { showToast } from "@/shared/stores/toast";
import { useWorkflow } from "@/features/workflows/hooks/useWorkflows";
import { ApiError } from "@/shared/api/http-client";
import { Spinner } from "@/shared/ui/atoms/Spinner";
import { QueryError } from "@/shared/ui/molecules/QueryError";
import { useAutosave } from "@/features/editor/hooks/useAutosave";
import { Canvas } from "@/features/editor/components/Canvas";
import { EditorToolbar } from "@/features/editor/components/EditorToolbar";
import { MobileEditor } from "@/features/editor/components/MobileEditor";
import { NodeLibrary } from "@/features/editor/components/NodeLibrary";
import { NodePicker } from "@/features/editor/components/NodePicker";
import { RightPanel } from "@/features/editor/components/RightPanel";
import { ScheduleModal } from "@/features/editor/components/ScheduleModal";
import { useRunner } from "@/features/editor/hooks/useRunner";

function useEditorShortcuts(save: () => Promise<void>) {
  const flow = useReactFlow();

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const editor = useEditor.getState();
      if (!(event.metaKey || event.ctrlKey)) return;
      const key = event.key.toLowerCase();
      if (key === "s") {
        event.preventDefault();
        editor.applyDraft();
        save().then(() => showToast({ message: "Workflow kaydedildi." }));
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
          flow
            .getNodes()
            .filter((node) => node.selected)
            .map((node) => node.id),
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flow, save]);
}

function DesktopEditor({ save }: { save: () => Promise<void> }) {
  useEditorShortcuts(save);
  const isTablet = useMediaQuery("(max-width: 1023px)");
  const run = useRunner(save);
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

function EditorBody() {
  const save = useAutosave();
  const isMobile = useMediaQuery("(max-width: 767px)");
  if (isMobile) return <MobileEditor onRetrySave={save} />;
  return (
    <ReactFlowProvider>
      <DesktopEditor save={save} />
    </ReactFlowProvider>
  );
}

function EditorContent({ id }: { id: string }) {
  const { data: workflow, isPending, error, refetch } = useWorkflow(id);
  const loadedId = useEditor((state) => state.workflowId);
  const load = useEditor((state) => state.load);
  const loadedOnce = useRef(false);

  useEffect(() => {
    if (workflow && !loadedOnce.current) {
      loadedOnce.current = true;
      load(workflow);
    }
  }, [load, workflow]);

  if (error instanceof ApiError && error.status === 404) {
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
  if (error) return <QueryError onRetry={() => refetch()} />;
  if (isPending || loadedId !== id) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-fg-muted">
        <Spinner size={24} />
      </div>
    );
  }

  return <EditorBody />;
}

export function EditorScreen({ id }: { id: string }) {
  return <EditorContent key={id} id={id} />;
}
