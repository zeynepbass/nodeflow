"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type InputHTMLAttributes } from "react";
import { Input } from "@/components/atoms/Input";

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function PasswordInput({ invalid, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  return (
    <span className="relative block">
      <Input
        {...props}
        invalid={invalid}
        type={visible ? "text" : "password"}
        className="pr-10"
      />
      <button
        type="button"
        aria-label="Şifreyi göster"
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
        className="absolute right-0 top-0 inline-flex size-10 items-center justify-center rounded-sm text-fg-muted hover:text-fg"
      >
        <Icon size={16} strokeWidth={1.5} aria-hidden />
      </button>
    </span>
  );
}
