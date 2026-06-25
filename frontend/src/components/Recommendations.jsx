import React from "react";

const priorityColor = { high: "#ef4444", medium: "#f97316", low: "#eab308" };
const priorityBg = { high: "#dc262611", medium: "#ea580c11", low: "#ca8a0411" };
const priorityBorder = { high: "#dc262633", medium: "#ea580c33", low: "#ca8a0433" };

export default function Recommendations({ recommendations }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div>
      <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 16 }}>
        ACTION RECOMMENDATIONS
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {recommendations.map((rec, i) => {
          const color = priorityColor[rec.priority] || "#64748b";
          const bg = priorityBg[rec.priority] || "#1e293b";
          const border = priorityBorder[rec.priority] || "#334155";
          return (
            <div key={i} style={{
              background: bg,
              border: `1px solid ${border}`,
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
            }}>
              <div style={{
                fontSize: 22, flexShrink: 0,
                width: 40, height: 40, borderRadius: 10,
                background: "#0f172a",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>{rec.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{rec.title}</div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color,
                    border: `1px solid ${border}`,
                    padding: "1px 8px", borderRadius: 20, textTransform: "uppercase",
                  }}>{rec.priority}</div>
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>{rec.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
