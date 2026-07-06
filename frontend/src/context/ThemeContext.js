import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

// Theme = "light" | "dark". Resolution order:
//   1. saved user choice in localStorage ("fh_theme")
//   2. OS/browser preference (prefers-color-scheme)
//   3. fallback "light"
// The inline script in public/index.html sets <html data-theme> BEFORE first
// paint (no flash); this context stays in sync and is the source of truth once
// React mounts.
const STORAGE_KEY = "fh_theme";

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch (_) { /* ignore */ }
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

const ThemeContext = createContext({ theme: "light", toggle: () => {}, setTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme);

  // Reflect current theme onto <html> + the browser chrome color.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#0f172a" : "#f4f6fb");
  }, [theme]);

  // If the user hasn't made an explicit choice, follow live OS changes.
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => {
      let saved = null;
      try { saved = localStorage.getItem(STORAGE_KEY); } catch (_) { /* ignore */ }
      if (saved !== "light" && saved !== "dark") setThemeState(e.matches ? "dark" : "light");
    };
    mq.addEventListener ? mq.addEventListener("change", handler) : mq.addListener(handler);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", handler) : mq.removeListener(handler);
    };
  }, []);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (_) { /* ignore */ }
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try { localStorage.setItem(STORAGE_KEY, next); } catch (_) { /* ignore */ }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
