import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e, #1a1f3a)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
    }}>
      <div style={{ textAlign: "center", maxWidth: 500 }}>
        <div style={{ fontSize: 72, fontWeight: 900, color: "#3b82f6", marginBottom: 16 }}>
          404
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#f1f5f9", marginBottom: 12 }}>
          Page Not Found
        </h1>
        <p style={{ fontSize: 16, color: "#94a3b8", marginBottom: 32, lineHeight: 1.6 }}>
          The page you're looking for doesn't exist. Let's get you back on track.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              border: "none",
              color: "#fff",
              padding: "14px 28px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 15px #3b82f644",
            }}
          >
            ← Back Home
          </button>
          <button
            onClick={() => window.history.back()}
            style={{
              background: "transparent",
              border: "1px solid #334155",
              color: "#94a3b8",
              padding: "14px 28px",
              borderRadius: 12,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
