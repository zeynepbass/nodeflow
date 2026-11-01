import { CloudOff } from "lucide-react";
import { Button } from "@/shared/ui/atoms/Button";
import { EmptyState } from "./EmptyState";

export function QueryError({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon={CloudOff}
      title="Veriler alınamadı"
      description="Bağlantını kontrol edip tekrar dene."
      action={<Button onClick={onRetry}>Tekrar Dene</Button>}
    />
  );
}
