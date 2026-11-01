"use client";

import { Button } from "@/shared/ui/atoms/Button";
import { showToast } from "@/shared/stores/toast";

export function GoogleButton({ label }: { label: string }) {
  return (
    <Button
      variant="secondary"
      className="w-full"
      onClick={() =>
        showToast({
          variant: "info",
          message: "Google ile giriş bu sürümde örnek olarak yer alıyor.",
        })
      }
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#4285F4"
          d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.8h3.5c2.1-1.9 3.3-4.7 3.3-8.1Z"
        />
        <path
          fill="#34A853"
          d="M12 23c3 0 5.5-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.2V17A11 11 0 0 0 12 23Z"
        />
        <path
          fill="#FBBC05"
          d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7H2.2a11 11 0 0 0 0 10l3.6-2.9Z"
        />
        <path
          fill="#EA4335"
          d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2.2 7l3.6 2.9C6.7 7.3 9.1 5.4 12 5.4Z"
        />
      </svg>
      {label}
    </Button>
  );
}
