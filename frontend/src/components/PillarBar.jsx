import React from "react";

const pillars = [
  { key: "cash_flow", label: "Cash Flow", icon: "💧", weight: "25%" },
  { key: "compliance", label: "Compliance", icon: "📋", weight: "20%" },
  { key: "growth", label: "Growth", icon: "📈", weight: "20%" },
  { key: "stability", label: "Stability", icon: "🏛️", weight: "20%" },
  { key: "credit_worthiness", label: "Credit History", icon: "💳", weight: "15%" },
];

const getColor = (score) => {
  if (score >= 75) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 45) return "#f97316";
  return "#ef4444";
};

export default function PillarBar({ scores }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {pillars.map((p) => {
        const score = scores[p.key] ?? 0;
        const color = getColor(score);
        return (
          <div key={p.key}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "#cbd5e1", display: "flex", alignItems: "center", gap: 6 }}>
                <span>{p.icon}</span> {p.label}
                <span style={{ fontSize: 10, color: "#475569", marginLeft: 4 }}>({p.weight})</span>
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color }}>{score}</span>
            </div>
            <div style={{ background: "var(--c-surface)", borderRadius: 8, height: 8, overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${score}%`,
                  background: `linear-gradient(90deg, ${color}88, ${color})`,
                  borderRadius: 8,
                  transition: "width 1s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
