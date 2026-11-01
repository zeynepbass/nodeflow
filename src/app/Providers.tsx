"use client";

import { useEffect, type ReactNode } from "react";
import { ToastHost } from "@/shared/ui/molecules/ToastHost";
import { useAuth } from "@/features/auth/store/auth";
import { usePreferences } from "@/features/settings/store/preferences";
import { useTheme } from "@/features/theme/store/theme";
import { useWorkspace } from "@/features/workflows/store/workspace";
import { applyTheme } from "@/features/theme/lib/theme";

export function Providers({ children }: { children: ReactNode }) {
  const preference = useTheme((state) => state.preference);

  useEffect(() => {
    useTheme.getState().hydrate();
    usePreferences.persist.rehydrate();
    Promise.resolve(useWorkspace.persist.rehydrate()).then(() =>
      useAuth.getState().hydrate(),
    );
  }, []);

  useEffect(() => {
    if (preference !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [preference]);

  return (
    <>
      {children}
      <ToastHost />
    </>
  );
}
