import type { ReactNode } from "react";
import { SessionBoundary } from "@/app/SessionBoundary";
import { AppShell } from "@/widgets/app-shell/AppShell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <SessionBoundary>
      <AppShell>{children}</AppShell>
    </SessionBoundary>
  );
}
