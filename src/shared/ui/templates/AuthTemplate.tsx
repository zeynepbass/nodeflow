import type { ReactNode } from "react";

export function AuthTemplate({ children }: { children: ReactNode }) {
  return (
    <main className="nokta-deseni flex min-h-dvh items-center justify-center px-4 py-10">
      {children}
    </main>
  );
}
