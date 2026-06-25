import React, { useState, useEffect } from "react";

const STEPS = [
  { icon: "📊", label: "Connecting to GST Portal", sub: "Fetching revenue & compliance data", duration: 900 },
  { icon: "🏦", label: "Account Aggregator (AA)", sub: "Pulling bank statements via RBI AA", duration: 1100 },
  { icon: "📱", label: "UPI Transaction Data", sub: "Analyzing 18 months cash flow", duration: 800 },
  { icon: "👥", label: "EPFO Records", sub: "Verifying employee & salary data", duration: 700 },
  { icon: "🧠", label: "Computing Health Score", sub: "Running XGBoost + 23 features", duration: 1000 },
  { icon: "💡", label: "Generating AI Explanation", sub: "SHAP values for transparency", duration: 600 },
];

export default function LoadingSteps({ onComplete }) {
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState([]);

  useEffect(() => {
    if (current >= STEPS.length) {
      setTimeout(onComplete, 400);
      return;
    }
    const t = setTimeout(() => {
      setDone((d) => [...d, current]);
      setCurrent((c) => c + 1);
    }, STEPS[current]?.duration || 800);
    return () => clearTimeout(t);
  }, [current, onComplete]);

  return (
    <div style={{
      minHeight: "60vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", padding: 32,
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%", marginBottom: 28,
        background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26,
        animation: "pulse 1.5s ease-in-out infinite",
      }}>⚡</div>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: "#f1f5f9" }}>
        Fetching Your Financial Data
      </h2>
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 32 }}>
        Securely pulling data via AA Framework • End-to-end encrypted
      </p>

      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", gap: 12 }}>
        {STEPS.map((step, i) => {
          const isDone = done.includes(i);
          const isActive = current === i;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "12px 16px",
              background: isDone ? "#15803d11" : isActive ? "#3b82f611" : "#1e293b",
              border: `1px solid ${isDone ? "#15803d44" : isActive ? "#3b82f644" : "#1e293b"}`,
              borderRadius: 12,
              transition: "all 0.3s",
              opacity: i > current ? 0.35 : 1,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: isDone ? "#15803d22" : isActive ? "#3b82f622" : "#0f172a",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>
                {isDone ? "✅" : isActive ? (
                  <span style={{ display: "inline-block", animation: "spin 0.8s linear infinite" }}>⏳</span>
                ) : step.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 13, fontWeight: 600,
                  color: isDone ? "#86efac" : isActive ? "#93c5fd" : "#475569",
                }}>{step.label}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{step.sub}</div>
              </div>
              {isDone && <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>Done</div>}
              {isActive && (
                <div style={{ display: "flex", gap: 3 }}>
                  {[0, 1, 2].map((d) => (
                    <div key={d} style={{
                      width: 4, height: 4, borderRadius: "50%", background: "#3b82f6",
                      animation: `bounce 0.8s ease-in-out ${d * 0.15}s infinite`,
                    }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%", maxWidth: 420, marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "#475569" }}>Processing</span>
          <span style={{ fontSize: 11, color: "#3b82f6", fontWeight: 600 }}>
            {Math.round((done.length / STEPS.length) * 100)}%
          </span>
        </div>
        <div style={{ background: "#1e293b", borderRadius: 8, height: 6, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${(done.length / STEPS.length) * 100}%`,
            background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
            borderRadius: 8,
            transition: "width 0.4s ease",
          }} />
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        @keyframes pulse { 0%, 100% { box-shadow: 0 0 0 0 #3b82f644; } 50% { box-shadow: 0 0 0 12px #3b82f600; } }
      `}</style>
    </div>
  );
}
