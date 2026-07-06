import React from "react";

// Reusable empty-state block: icon + title + message + optional action button.
export default function EmptyState({ icon = "📊", title, message, actionLabel, onAction, disabled }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, var(--c-surface), var(--c-bg))",
      border: "1px solid var(--c-border)",
      borderRadius: 24, padding: 64, textAlign: "center",
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20, margin: "0 auto 20px",
        background: "linear-gradient(135deg, #3b82f622, #8b5cf622)",
        border: "1px solid #3b82f633",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32,
      }}>{icon}</div>
      <div style={{ color: "var(--c-text)", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{title}</div>
      {message && <div style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>{message}</div>}
      {actionLabel && (
        <button onClick={onAction} disabled={disabled} style={{
          padding: "12px 28px", borderRadius: 12,
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          border: "none", color: "#fff", fontSize: 14, fontWeight: 700,
          cursor: disabled ? "not-allowed" : "pointer", boxShadow: "0 4px 20px #3b82f644",
        }}>{actionLabel}</button>
      )}
    </div>
  );
}
