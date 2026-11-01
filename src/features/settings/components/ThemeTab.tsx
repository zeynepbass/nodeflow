"use client";

import { Check, Palette } from "lucide-react";
import type { ReactNode } from "react";
import { useTheme } from "@/features/theme/store/theme";
import type { ThemePreference } from "@/features/theme/lib/theme";
import { cn } from "@/shared/lib/cn";
import { SettingsSection } from "./SettingsSection";

const palettes = {
  light: { base: "#FAFAFB", panel: "#FFFFFF", line: "#D8DBE1", text: "#AEB4BE" },
  dark: { base: "#0E0F14", panel: "#161822", line: "#262A35", text: "#3F4350" },
};

function Preview({ palette }: { palette: keyof typeof palettes }) {
  const { base, panel, line, text } = palettes[palette];
  return (
    <span
      aria-hidden
      style={{ background: base }}
      className="flex h-full w-full gap-1.5 p-2"
    >
      <span
        style={{ background: panel, borderColor: line }}
        className="flex w-7 flex-col gap-1 rounded-xs border p-1"
      >
        <span className="h-1.5 rounded-full bg-primary-500" />
        <span style={{ background: text }} className="h-1 rounded-full" />
        <span style={{ background: text }} className="h-1 rounded-full" />
      </span>
      <span className="flex flex-1 flex-col gap-1.5">
        <span
          style={{ background: panel, borderColor: line }}
          className="h-3.5 rounded-xs border"
        />
        <span
          style={{ background: panel, borderColor: line }}
          className="flex flex-1 items-end gap-1 rounded-xs border p-1.5"
        >
          <span className="h-1/2 w-2 rounded-[2px] bg-primary-500" />
          <span className="h-3/4 w-2 rounded-[2px] bg-[var(--secondary-500)]" />
          <span style={{ background: text }} className="h-1/3 w-2 rounded-[2px]" />
        </span>
      </span>
    </span>
  );
}

const options: {
  value: ThemePreference;
  label: string;
  hint: string;
  preview: ReactNode;
}[] = [
  {
    value: "light",
    label: "Açık",
    hint: "Aydınlık ortamlar için",
    preview: <Preview palette="light" />,
  },
  {
    value: "dark",
    label: "Koyu",
    hint: "Göz yormayan görünüm",
    preview: <Preview palette="dark" />,
  },
  {
    value: "system",
    label: "Sistem",
    hint: "Cihazını takip eder",
    preview: (
      <span aria-hidden className="grid h-full w-full grid-cols-2">
        <span className="overflow-hidden">
          <Preview palette="light" />
        </span>
        <span className="overflow-hidden">
          <Preview palette="dark" />
        </span>
      </span>
    ),
  },
];

export function ThemeTab() {
  const preference = useTheme((state) => state.preference);
  const setPreference = useTheme((state) => state.setPreference);

  return (
    <SettingsSection
      icon={Palette}
      title="Görünüm"
      description="Sistem seçeneği, cihazının görünüm ayarını otomatik takip eder."
    >
      <div
        role="radiogroup"
        aria-label="Tema"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        {options.map(({ value, label, hint, preview }) => {
          const selected = preference === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={label}
              onClick={() => setPreference(value)}
              className={cn(
                "group relative overflow-hidden rounded-lg border-2 text-left transition-[border-color,box-shadow] duration-100",
                selected
                  ? "border-primary-500 shadow-elevation-2"
                  : "border-line hover:border-primary-200",
              )}
            >
              <span className="block h-28 overflow-hidden">{preview}</span>
              <span className="block border-t border-line p-3">
                <span className="block font-medium">{label}</span>
                <span className="block text-caption text-fg-muted">{hint}</span>
              </span>
              {selected && (
                <span className="absolute right-2 top-2 inline-flex size-6 items-center justify-center rounded-full bg-action text-white">
                  <Check size={14} strokeWidth={2} aria-hidden />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </SettingsSection>
  );
}
