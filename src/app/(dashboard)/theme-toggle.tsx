"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";
import AuthIcon from "../(auth)/auth-icons";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function currentTheme(): Theme {
  return document.documentElement.dataset.hmTheme === "light" ? "light" : "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.hmTheme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private mode, policy): the theme still changes for this visit.
  }
  listeners.forEach((listener) => listener());
}

/** Switches between the dark (default) and light token sets and remembers the choice (HU-16). */
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => "dark" as Theme);
  const next: Theme = theme === "dark" ? "light" : "dark";
  const nextLabel = next === "light" ? "claro" : "oscuro";
  return (
    <button type="button" onClick={() => applyTheme(next)} aria-label={`Cambiar a modo ${nextLabel}`} className="btn-secondary">
      <AuthIcon name={next === "light" ? "sun" : "moon"} size={16} />
      <span aria-hidden="true">Modo {nextLabel}</span>
    </button>
  );
}
