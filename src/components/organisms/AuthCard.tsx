import type { ReactNode } from "react";
import { LogoMark } from "@/components/atoms/LogoMark";
import { cn } from "@/lib/cn";

export function AuthCard({
  title,
  description,
  width = "max-w-[400px]",
  footer,
  children,
}: {
  title: string;
  description: string;
  width?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={cn("w-full", width)}>
      <div className="mb-6 flex justify-center">
        <LogoMark wordmark />
      </div>
      <div className="rounded-2xl bg-surface p-6 shadow-elevation-2 sm:p-8">
        <h1 className="text-h1">{title}</h1>
        <p className="mt-1 text-fg-muted">{description}</p>
        <div className="mt-6">{children}</div>
      </div>
      {footer && (
        <p className="mt-6 text-center text-body text-fg-muted">{footer}</p>
      )}
    </div>
  );
}
