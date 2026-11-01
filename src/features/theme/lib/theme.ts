export type ThemePreference = "light" | "dark" | "system";

export const THEME_KEY = "nodeflow-tema";

export const themeScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme="light"}})()`;

export function resolveTheme(preference: ThemePreference): "light" | "dark" {
  if (preference !== "system") return preference;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  root.classList.add("tema-gecisi");
  root.dataset.theme = resolveTheme(preference);
  window.setTimeout(() => root.classList.remove("tema-gecisi"), 200);
}
