"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/features/theme/store/theme";
import { Segmented } from "@/shared/ui/molecules/Segmented";

const icon = (Icon: typeof Sun) => <Icon size={16} strokeWidth={1.5} aria-hidden />;

export function ThemeSwitcher() {
  const preference = useTheme((state) => state.preference);
  const setPreference = useTheme((state) => state.setPreference);
  return (
    <Segmented
      label="Tema"
      value={preference}
      onChange={setPreference}
      options={[
        { value: "light", label: icon(Sun), ariaLabel: "Açık tema" },
        { value: "dark", label: icon(Moon), ariaLabel: "Koyu tema" },
        { value: "system", label: icon(Monitor), ariaLabel: "Sistem teması" },
      ]}
    />
  );
}
