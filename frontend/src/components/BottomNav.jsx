import React from "react";

// Native-app-style fixed bottom tab bar (mobile only).
export default function BottomNav({ tabs, active, onSelect }) {
  return (
    <nav style={{
      position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 300,
      display: "flex",
      background: "var(--c-navbar)",
      backdropFilter: "blur(14px)",
      borderTop: "1px solid var(--c-border-soft)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      boxShadow: "0 -4px 24px #00000055",
    }}>
      {tabs.map((t) => {
        const on = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onSelect(t.key)}
            style={{
              flex: 1, background: "none", border: "none", cursor: "pointer",
              padding: "9px 0 11px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              position: "relative",
              color: on ? "#3b82f6" : "#64748b",
              transition: "color 0.15s",
            }}
          >
            {on && (
              <span style={{
                position: "absolute", top: 0, width: 26, height: 3, borderRadius: 3,
                background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
              }} />
            )}
            <span style={{ fontSize: 21, opacity: on ? 1 : 0.75 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: on ? 700 : 500, letterSpacing: 0.2 }}>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
