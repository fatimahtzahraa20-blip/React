import { useEffect, useState } from "react";

const STORAGE_KEY = "retail-pro-theme";

function resolveTheme(theme) {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function useTheme() {
  const [theme, setThemeState] = useState(() => localStorage.getItem(STORAGE_KEY) || "system");

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => document.documentElement.classList.toggle("dark", resolveTheme(theme) === "dark");
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [theme]);

  const setTheme = (nextTheme) => {
    localStorage.setItem(STORAGE_KEY, nextTheme);
    setThemeState(nextTheme);
  };

  return { theme, setTheme, resolvedTheme: resolveTheme(theme) };
}
