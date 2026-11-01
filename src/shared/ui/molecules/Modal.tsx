"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

const widths = { sm: "max-w-[400px]", md: "max-w-[560px]", lg: "max-w-[720px]" };

export function Modal({
  open,
  onClose,
  title,
  size = "sm",
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: keyof typeof widths;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={cn("modal", widths[size])}
    >
      {open && (
        <div className="flex max-h-[calc(100dvh-32px)] flex-col">
          <h2 className="px-6 pt-6 text-h2">{title}</h2>
          <div className="overflow-y-auto px-6 py-4">{children}</div>
          {footer && (
            <div className="flex items-center justify-between gap-2 px-6 pb-6">
              {footer}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}
