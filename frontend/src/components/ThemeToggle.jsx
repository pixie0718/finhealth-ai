import React from "react";
import { useTheme } from "../context/ThemeContext";

// Compact sun/moon toggle for headers. Shows the icon of the theme you'll switch
// TO, so it reads as an action. Works on both light & dark via theme tokens.
export default function ThemeToggle({ size = 34 }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
      style={{
        width: size,
        height: size,
        borderRadius: 9,
        border: "1px solid var(--c-border)",
        background: "var(--c-surface-2)",
        color: "var(--c-text)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 15,
        lineHeight: 1,
        padding: 0,
        transition: "background 0.2s, border-color 0.2s, transform 0.15s",
      }}
      onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.92)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
