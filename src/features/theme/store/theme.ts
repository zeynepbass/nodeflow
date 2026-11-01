import { create } from "zustand";
import { applyTheme, THEME_KEY, type ThemePreference } from "@/features/theme/lib/theme";

interface ThemeState {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  hydrate: () => void;
}

export const useTheme = create<ThemeState>((set) => ({
  preference: "system",
  setPreference: (preference) => {
    try {
      localStorage.setItem(THEME_KEY, preference);
    } catch {}
    applyTheme(preference);
    set({ preference });
  },
  hydrate: () => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_KEY);
    } catch {}
    if (stored === "light" || stored === "dark" || stored === "system") {
      set({ preference: stored });
    }
  },
}));
