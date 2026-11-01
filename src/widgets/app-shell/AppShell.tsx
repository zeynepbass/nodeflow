"use client";

import dynamic from "next/dynamic";
import { useEffect, type ReactNode } from "react";
import { useUi } from "@/shared/stores/ui";
import { WorkspaceTemplate } from "@/shared/ui/templates/WorkspaceTemplate";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

const CommandPalette = dynamic(
  () => import("@/features/command-palette/components/CommandPalette"),
  { ssr: false },
);

const NewWorkflowModal = dynamic(
  () => import("@/features/workflows/components/NewWorkflowModal"),
  { ssr: false },
);

function usePaletteShortcut() {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        const { paletteOpen, setPaletteOpen } = useUi.getState();
        setPaletteOpen(!paletteOpen);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

function LazyOverlays() {
  const paletteOpen = useUi((state) => state.paletteOpen);
  const newWorkflowOpen = useUi((state) => state.newWorkflowOpen);
  return (
    <>
      {paletteOpen && <CommandPalette />}
      {newWorkflowOpen && <NewWorkflowModal />}
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  usePaletteShortcut();
  return (
    <WorkspaceTemplate
      sidebar={<AppSidebar />}
      topBar={<TopBar />}
      overlays={<LazyOverlays />}
    >
      {children}
    </WorkspaceTemplate>
  );
}
