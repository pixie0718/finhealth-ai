import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ScoreRing } from "./landing/pieces";

// Preset demo scenarios (no login/backend needed) — matches the README "Try Live Demos".
const SCENARIOS = {
  "growth-star": {
    name: "Sharma Textiles Pvt. Ltd.", city: "Surat", type: "Textile", gstin: "27AAPFU0939F1ZV",
    score: 82, band: "LOW", rec: "APPROVE", loan: 5000000, color: "#22c55e",
    tag: "📈 Growth Star", blurb: "Excellent business — instant approval.",
    pillars: [["Cash Flow", 82, "#3b82f6"], ["Compliance", 91, "#8b5cf6"], ["Growth", 76, "#06b6d4"], ["Stability", 84, "#f59e0b"], ["Credit", 79, "#ec4899"]],
  },
  "ntc-challenge": {
    name: "Fresh Foods Cooperative", city: "Delhi", type: "Food Processing", gstin: "19AACCU1234F2Z5",
    score: 67, band: "MEDIUM-LOW", rec: "RECOMMEND FOR REVIEW", loan: 2000000, color: "#eab308",
    tag: "🌱 New-to-Credit", blurb: "New business, no CIBIL — scored fairly on alternate data.",
    pillars: [["Cash Flow", 68, "#3b82f6"], ["Compliance", 72, "#8b5cf6"], ["Growth", 65, "#06b6d4"], ["Stability", 62, "#f59e0b"], ["Credit", 0, "#ec4899"]],
  },
  "risk-case": {
    name: "Old Town Traders", city: "Kanpur", type: "Retail", gstin: "09AAACR5055K1Z5",
    score: 42, band: "HIGH", rec: "DECLINE / CONDITIONAL", loan: 300000, color: "#ef4444",
    tag: "⚠️ Risk Case", blurb: "High risk — conditional, government-scheme options only.",
    pillars: [["Cash Flow", 44, "#3b82f6"], ["Compliance", 48, "#8b5cf6"], ["Growth", 33, "#06b6d4"], ["Stability", 41, "#f59e0b"], ["Credit", 38, "#ec4899"]],
  },
};

const fmt = (v) => (v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${Number(v || 0).toLocaleString("en-IN")}`);

export default function DemoPortal() {
  const { scenario } = useParams();
  const navigate = useNavigate();
  const s = SCENARIOS[scenario] || SCENARIOS["growth-star"];

  return (
    <div style={{ minHeight: "100vh", background: "#080c18", color: "var(--c-text-2)", padding: "24px 16px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <button onClick={() => navigate("/")} style={{ background: "transparent", border: "1px solid var(--c-border)", color: "#94a3b8", padding: "8px 14px", borderRadius: 9, fontSize: 13, cursor: "pointer", marginBottom: 20 }}>← Back to home</button>

        {/* Scenario switcher */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {Object.entries(SCENARIOS).map(([key, v]) => (
            <button key={key} onClick={() => navigate(`/demo/${key}`)} style={{
              padding: "7px 14px", borderRadius: 20, fontSize: 12.5, cursor: "pointer", fontWeight: 600,
              background: key === scenario ? `${v.color}22` : "#0f1a30",
              border: `1px solid ${key === scenario ? v.color + "66" : "var(--c-surface)"}`,
              color: key === scenario ? v.color : "#94a3b8",
            }}>{v.tag}</button>
          ))}
        </div>

        <div style={{ fontSize: 11, letterSpacing: 2, color: "#818cf8", fontWeight: 700, marginBottom: 6 }}>LIVE DEMO · NO LOGIN NEEDED</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--c-text)", marginBottom: 4 }}>{s.name}</h1>
        <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>{s.gstin} · 📍 {s.city} · 🏭 {s.type}</div>

        {/* Score + eligibility card */}
        <div style={{ background: "linear-gradient(160deg, #141f38, #0c1424)", border: "1px solid #2a3a5f", borderRadius: 22, padding: 28, marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <ScoreRing target={s.score} size={120} />
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "inline-block", fontSize: 11, fontWeight: 800, color: s.color, background: `${s.color}18`, border: `1px solid ${s.color}55`, padding: "3px 12px", borderRadius: 20, marginBottom: 8 }}>{s.band} RISK · {s.rec}</div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>{s.blurb}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 12 }}>Eligible loan amount</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: "var(--c-text)" }}>{fmt(s.loan)}</div>
            </div>
          </div>
          <div style={{ marginTop: 22, borderTop: "1px solid var(--c-border-soft)", paddingTop: 18 }}>
            <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1, marginBottom: 12 }}>5-PILLAR BREAKDOWN</div>
            {s.pillars.map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 9 }}>
                <div style={{ width: 84, fontSize: 12, color: "#94a3b8" }}>{l}</div>
                <div style={{ flex: 1, height: 8, background: "var(--c-surface)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${v}%`, height: "100%", background: v ? c : "var(--c-surface-2)", borderRadius: 4 }} />
                </div>
                <div style={{ width: 30, fontSize: 12, fontWeight: 700, color: v ? "#cbd5e1" : "#475569", textAlign: "right" }}>{v || "N/A"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button onClick={() => navigate("/owner/login")} style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", border: "none", color: "#fff", padding: "13px 24px", borderRadius: 12, fontSize: 14.5, fontWeight: 700, cursor: "pointer" }}>Get my own score →</button>
          <button onClick={() => navigate("/manager/login")} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", color: "var(--c-text-2)", padding: "13px 24px", borderRadius: 12, fontSize: 14.5, fontWeight: 700, cursor: "pointer" }}>🏦 Bank Officer login</button>
        </div>
      </div>
    </div>
  );
}
