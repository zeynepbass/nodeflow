"use client";

import { Laptop, Smartphone } from "lucide-react";
import { useEndSession, useSessions } from "@/features/auth/hooks/useAuth";
import { showToast } from "@/shared/stores/toast";
import { Badge } from "@/shared/ui/atoms/Badge";
import { Button } from "@/shared/ui/atoms/Button";
import { Spinner } from "@/shared/ui/atoms/Spinner";

export function SessionList() {
  const { data } = useSessions();
  const end = useEndSession();

  if (!data) {
    return (
      <div className="flex justify-center py-4 text-fg-muted">
        <Spinner />
      </div>
    );
  }
  return (
    <ul className="divide-y divide-line">
      {data.map(({ id, device, location, current }) => {
        const Icon = /iPhone|Android/.test(device) ? Smartphone : Laptop;
        return (
          <li key={id} className="flex items-center gap-3 py-3">
            <Icon size={20} strokeWidth={1.5} aria-hidden className="text-fg-muted" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{device}</p>
              <p className="text-caption text-fg-muted">{location}</p>
            </div>
            {current ? (
              <Badge variant="primary">Bu Oturum</Badge>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  end.mutate(id, {
                    onSuccess: () => showToast({ message: "Oturum sonlandırıldı." }),
                  })
                }
              >
                Sonlandır
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
