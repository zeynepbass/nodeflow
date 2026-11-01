"use client";

import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useToasts, type Toast } from "@/lib/stores/toast";

const icons = { success: CircleCheck, error: CircleAlert, info: Info };
const tones = {
  success: "text-state-success",
  error: "text-state-error",
  info: "text-on-soft-info",
};

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToasts((state) => state.dismiss);
  const timer = useRef<number | undefined>(undefined);
  const Icon = icons[toast.variant];

  const start = () => {
    timer.current = window.setTimeout(() => dismiss(toast.id), 4000);
  };
  const stop = () => window.clearTimeout(timer.current);

  useEffect(() => {
    timer.current = window.setTimeout(() => dismiss(toast.id), 4000);
    return () => window.clearTimeout(timer.current);
  }, [dismiss, toast.id]);

  return (
    <div
      role="status"
      onMouseEnter={stop}
      onMouseLeave={start}
      className="pointer-events-auto flex w-80 max-w-[calc(100vw-32px)] animate-toast-in items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 shadow-elevation-3"
    >
      <Icon size={20} strokeWidth={1.5} aria-hidden className={`shrink-0 ${tones[toast.variant]}`} />
      <p className="flex-1 text-body">{toast.message}</p>
      {toast.onAction && (
        <button
          type="button"
          onClick={() => {
            toast.onAction?.();
            dismiss(toast.id);
          }}
          className="text-body font-medium text-link hover:underline"
        >
          {toast.actionLabel}
        </button>
      )}
      <button
        type="button"
        aria-label="Bildirimi kapat"
        onClick={() => dismiss(toast.id)}
        className="inline-flex size-8 items-center justify-center rounded-xs text-fg-muted hover:bg-surface-hover"
      >
        <X size={16} strokeWidth={1.5} aria-hidden />
      </button>
    </div>
  );
}

export function ToastHost() {
  const toasts = useToasts((state) => state.toasts);
  return (
    <div className="pointer-events-none fixed right-4 top-[76px] z-[60] flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
