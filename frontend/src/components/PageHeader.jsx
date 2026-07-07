import React from "react";
import { useNavigate } from "react-router-dom";

export default function PageHeader({ title, subtitle, icon, action, actionText }) {
  const navigate = useNavigate();

  return (
    <div style={{
      borderBottom: "1px solid #1e293b",
      padding: "20px 24px",
      background: "linear-gradient(135deg, #0f172a 0%, #1a1f3a 100%)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      position: "sticky",
      top: 0,
      zIndex: 40,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {icon && (
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "#1e293b",
            border: "1px solid #334155",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
          }}>
            {icon}
          </div>
        )}
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0 0" }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action && (
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
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 20px #3b82f655";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 15px #3b82f644";
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
