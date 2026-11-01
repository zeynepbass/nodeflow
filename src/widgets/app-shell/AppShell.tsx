"use client";

import type { ReactNode } from "react";
import { CommandPalette } from "@/features/command-palette/components/CommandPalette";
import { NewWorkflowModal } from "@/features/workflows/components/NewWorkflowModal";
import { WorkspaceTemplate } from "@/shared/ui/templates/WorkspaceTemplate";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <WorkspaceTemplate
      sidebar={<AppSidebar />}
      topBar={<TopBar />}
      overlays={
        <>
          <CommandPalette />
          <NewWorkflowModal />
        </>
      }
    >
      {children}
    </WorkspaceTemplate>
  );
}
