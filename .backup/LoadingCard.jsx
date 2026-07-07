import React from "react";

export default function LoadingCard({ count = 3 }) {
  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 12,
              padding: 16,
              marginBottom: 12,
              animation: "pulse 2s infinite",
            }}
          >
            <div
              style={{
                height: 20,
                background: "#334155",
                borderRadius: 8,
                marginBottom: 8,
                animation: "pulse 2s infinite",
              }}
            />
            <div
              style={{
                height: 14,
                background: "#334155",
                borderRadius: 8,
                width: "80%",
                animation: "pulse 2s infinite",
              }}
            />
          </div>
        ))}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </>
  );
}
