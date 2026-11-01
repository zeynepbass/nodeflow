import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { Label } from "@/shared/ui/atoms/Label";

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p
      id={id}
      aria-live="polite"
      className="mt-1 flex items-start gap-1 text-caption text-state-error"
    >
      <CircleAlert size={14} strokeWidth={1.5} aria-hidden className="mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  labelAside,
  children,
}: {
  label: ReactNode;
  htmlFor: string;
  required?: boolean;
  error?: ReactNode;
  hint?: ReactNode;
  labelAside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center gap-1">
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
        {labelAside}
      </div>
      <div
        key={error ? "hata" : "normal"}
        className={error ? "animate-shake" : undefined}
      >
        {children}
      </div>
      {error ? (
        <FieldError id={`${htmlFor}-hata`}>{error}</FieldError>
      ) : (
        hint && <p className="mt-1 text-caption text-fg-muted">{hint}</p>
      )}
    </div>
  );
}
