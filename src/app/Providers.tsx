"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "@/features/theme/store/theme";
import { applyTheme } from "@/features/theme/lib/theme";
import { createQueryClient } from "@/shared/api/query-client";
import { ToastHost } from "@/shared/ui/molecules/ToastHost";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [queryClient] = useState(() =>
    createQueryClient(() => {
      router.push("/giris");
      router.refresh();
    }),
  );
  const preference = useTheme((state) => state.preference);

  useEffect(() => {
    useTheme.getState().hydrate();
  }, []);

  useEffect(() => {
    if (preference !== "system") return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [preference]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastHost />
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}
