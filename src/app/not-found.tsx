import { SearchX } from "lucide-react";
import Link from "next/link";
import { buttonClass } from "@/shared/ui/atoms/Button";
import { EmptyState } from "@/shared/ui/molecules/EmptyState";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center">
      <EmptyState
        icon={SearchX}
        title="Sayfa bulunamadı"
        description="Aradığın sayfa taşınmış veya hiç var olmamış olabilir."
        action={
          <Link href="/" className={buttonClass()}>
            Ana Sayfaya Dön
          </Link>
        }
      />
    </main>
  );
}
