import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";
import { fieldClass } from "@/shared/ui/atoms/Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  mono?: boolean;
}

export function Textarea({ invalid, mono, className, ...props }: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={cn(fieldClass(invalid, mono), "min-h-20 py-2", className)}
      {...props}
    />
  );
}
