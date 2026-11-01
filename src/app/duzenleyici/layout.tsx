import type { ReactNode } from "react";
import { SessionBoundary } from "@/app/SessionBoundary";

export default function EditorLayout({ children }: { children: ReactNode }) {
  return <SessionBoundary>{children}</SessionBoundary>;
}
