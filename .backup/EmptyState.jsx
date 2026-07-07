import React from "react";

export default function EmptyState({ icon = "📭", title, description, action, actionText }) {
  return (
    <div style={{
      textAlign: "center",
      padding: "60px 20px",
      background: "#1e293b",
      borderRadius: 16,
      border: "1px solid #334155",
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>
        {title}
      </div>
      {description && (
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20, maxWidth: 400, margin: "0 auto 20px" }}>
          {description}
        </div>
      )}
      {action && actionText && (
        <button
          onClick={action}
          style={{
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            border: "none",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 4px 15px #3b82f644",
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
