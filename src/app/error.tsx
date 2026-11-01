"use client";

import { TriangleAlert } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { EmptyState } from "@/shared/ui/molecules/EmptyState";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <EmptyState
        icon={TriangleAlert}
        title="Bir şeyler ters gitti"
        description="Sayfayı yeniden yüklemeyi dene."
        action={<Button onClick={reset}>Tekrar Dene</Button>}
      />
    </main>
  );
}
