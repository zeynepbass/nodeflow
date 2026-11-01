import type { ReactNode } from "react";
import { AppShell } from "@/widgets/app-shell/AppShell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
