"use client";

import { useEffect, type ReactNode } from "react";
import { ToastHost } from "@/components/molecules/ToastHost";
import { useAuth } from "@/lib/stores/auth";
import { useTheme } from "@/lib/stores/theme";
import { useWorkspace } from "@/lib/stores/workspace";
import { applyTheme } from "@/lib/theme";

export function Providers({ children }: { children: ReactNode }) {
  const preference = useTheme((state) => state.preference);

  useEffect(() => {
    useTheme.getState().hydrate();
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
