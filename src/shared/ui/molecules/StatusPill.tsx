import { Check, Circle, Pause, Pencil, X, Zap } from "lucide-react";
import { Badge, type BadgeVariant } from "@/shared/ui/atoms/Badge";
import { Spinner } from "@/shared/ui/atoms/Spinner";
import { cn } from "@/shared/lib/cn";

export type PillStatus =
  | "success"
  | "error"
  | "running"
  | "waiting"
  | "active"
  | "draft"
  | "stopped";

const config: Record<
  PillStatus,
  { label: string; variant: BadgeVariant; icon: typeof Check }
> = {
  success: { label: "Başarılı", variant: "success", icon: Check },
  error: { label: "Hatalı", variant: "error", icon: X },
  running: { label: "Çalışıyor", variant: "primary", icon: Circle },
  waiting: { label: "Bekliyor", variant: "neutral", icon: Circle },
  active: { label: "Aktif", variant: "success", icon: Zap },
  draft: { label: "Taslak", variant: "neutral", icon: Pencil },
  stopped: { label: "Durduruldu", variant: "warning", icon: Pause },
};

export function StatusPill({
  status,
  large,
}: {
  status: PillStatus;
  large?: boolean;
}) {
  const { label, variant, icon: Icon } = config[status];
  return (
    <Badge variant={variant} className={cn(large && "h-7 px-3 text-body")}>
      {status === "running" ? (
        <span aria-hidden className="size-2 animate-pulse-dot rounded-full bg-action" />
      ) : (
        <Icon size={large ? 16 : 14} strokeWidth={1.5} aria-hidden />
      )}
      {label}
    </Badge>
  );
}

export function SaveStatusPill({
  state,
  onRetry,
}: {
  state: "saved" | "saving" | "error";
  onRetry?: () => void;
}) {
  if (state === "saving") {
    return (
      <Badge variant="primary">
        <Spinner size={14} />
        Kaydediliyor…
      </Badge>
    );
  }
  if (state === "error") {
    return (
      <Badge variant="error">
        Kaydedilemedi
        <button type="button" onClick={onRetry} className="underline">
          Tekrar dene
        </button>
      </Badge>
    );
  }
  return (
    <Badge variant="success">
      <span aria-hidden className="size-1.5 rounded-full bg-state-success" />
      Kaydedildi
    </Badge>
  );
}
