"use client";

import { cn } from "@/shared/lib/cn";
import { useTheme } from "@/features/theme/store/theme";
import type { ThemePreference } from "@/features/theme/lib/theme";

const options: {
  value: ThemePreference;
  label: string;
  base: string;
  panel: string;
  line: string;
}[] = [
  { value: "light", label: "Açık", base: "#FAFAFB", panel: "#FFFFFF", line: "#D8DBE1" },
  { value: "dark", label: "Koyu", base: "#0E0F14", panel: "#161822", line: "#262A35" },
];

function Preview({ base, panel, line }: { base: string; panel: string; line: string }) {
  return (
    <span
      aria-hidden
      style={{ background: base }}
      className="flex h-20 gap-1 rounded-sm p-2"
    >
      <span
        style={{ background: panel, borderColor: line }}
        className="w-5 rounded-xs border"
      />
      <span className="flex flex-1 flex-col gap-1">
        <span
          style={{ background: panel, borderColor: line }}
          className="h-3 rounded-xs border"
        />
        <span
          style={{ background: panel, borderColor: line }}
          className="flex-1 rounded-xs border"
        />
      </span>
    </span>
  );
}

export function ThemeTab() {
  const preference = useTheme((state) => state.preference);
  const setPreference = useTheme((state) => state.setPreference);

  const card = (value: ThemePreference, label: string, preview: React.ReactNode) => (
    <button
      key={value}
      type="button"
      role="radio"
      aria-checked={preference === value}
      onClick={() => setPreference(value)}
      className={cn(
        "flex flex-col gap-2 rounded-lg border-2 bg-surface p-3 text-left font-medium transition-colors duration-100",
        preference === value
          ? "border-primary-500"
          : "border-line hover:border-primary-200",
      )}
    >
      {preview}
      {label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      <div
        role="radiogroup"
        aria-label="Tema"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {options.map((option) =>
          card(option.value, option.label, <Preview {...option} />),
        )}
        {card(
          "system",
          "Sistem",
          <span aria-hidden className="grid h-20 grid-cols-2 overflow-hidden rounded-sm">
            <Preview {...options[0]} />
            <Preview {...options[1]} />
          </span>,
        )}
      </div>
      <p className="text-caption text-fg-muted">
        Sistem seçeneği, cihazının görünüm ayarını otomatik takip eder.
      </p>
    </div>
  );
}
