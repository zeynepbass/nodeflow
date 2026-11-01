"use client";

import { ReactFlowProvider, useReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useState } from "react";
import { useRunner } from "@/features/editor/hooks/useRunner";
import { useEditor } from "@/features/editor/store/editor";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery";
import { showToast } from "@/shared/stores/toast";
import "./canvas.css";
import { Canvas } from "./Canvas";
import { EditorToolbar } from "./EditorToolbar";
import { NodeLibrary } from "./NodeLibrary";
import { NodePicker } from "./NodePicker";
import { RightPanel } from "./RightPanel";
import { ScheduleModal } from "./ScheduleModal";

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

function DesktopEditorContent({ save }: { save: () => Promise<void> }) {
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

export default function DesktopEditor({ save }: { save: () => Promise<void> }) {
  return (
    <ReactFlowProvider>
      <DesktopEditorContent save={save} />
    </ReactFlowProvider>
  );
}
