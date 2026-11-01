"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Spinner } from "@/components/atoms/Spinner";
import { useAuth } from "@/lib/stores/auth";
import { AppSidebar } from "./AppSidebar";
import { CommandPalette } from "./CommandPalette";
import { NewWorkflowModal } from "./NewWorkflowModal";
import { TopBar } from "./TopBar";

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const ready = useAuth((state) => state.ready);
  const user = useAuth((state) => state.user);

  useEffect(() => {
    if (ready && !user) router.replace("/giris");
  }, [ready, router, user]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-fg-muted">
        <Spinner size={24} />
      </div>
    );
  }
  return children;
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <div className="flex min-h-dvh">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 p-4 md:p-6 xl:p-10">
            <div className="mx-auto max-w-[1440px]">{children}</div>
          </main>
        </div>
      </div>
      <CommandPalette />
      <NewWorkflowModal />
    </AuthGate>
  );
}
