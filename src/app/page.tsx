"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/shared/ui/atoms/Spinner";
import { useAuth } from "@/features/auth/store/auth";

export default function Page() {
  const router = useRouter();
  const ready = useAuth((state) => state.ready);
  const user = useAuth((state) => state.user);

  useEffect(() => {
    if (ready) router.replace(user ? "/panel" : "/giris");
  }, [ready, router, user]);

  return (
    <main className="flex min-h-dvh items-center justify-center text-fg-muted">
      <Spinner size={24} />
    </main>
  );
}
