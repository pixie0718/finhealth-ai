import React from "react";

// Simple centered loading placeholder card.
export default function LoadingCard({ label = "Loading…" }) {
  return (
    <div style={{
      textAlign: "center", padding: 80, color: "#475569",
      background: "var(--c-surface)", borderRadius: 20, border: "1px solid var(--c-border)",
    }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
      {label}
    </div>
  );
}
