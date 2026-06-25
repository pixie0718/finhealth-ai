import React from "react";

const STATS = [
  { value: "10,000+", label: "MSMEs Assessed" },
  { value: "98.2%", label: "ML Accuracy" },
  { value: "< 30s", label: "Score Generated" },
  { value: "6", label: "Loan Products" },
];

const DATA_SOURCES = [
  { icon: "📊", label: "GST Portal" },
  { icon: "🏦", label: "Account Aggregator" },
  { icon: "📱", label: "UPI / NPCI" },
  { icon: "👥", label: "EPFO" },
  { icon: "💳", label: "Credit Bureau" },
];

export default function Landing({ onSelect }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0f1e",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Background glow blobs */}
      <div style={{
        position: "absolute", top: "-10%", left: "20%",
        width: 500, height: 500,
        background: "radial-gradient(circle, #3b82f618 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "5%", right: "15%",
        width: 400, height: 400,
        background: "radial-gradient(circle, #8b5cf618 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "40%", left: "-5%",
        width: 300, height: 300,
        background: "radial-gradient(circle, #06b6d412 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />

      {/* Top badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "#1e293b", border: "1px solid #3b82f633",
        padding: "6px 18px", borderRadius: 20, marginBottom: 28,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block", boxShadow: "0 0 8px #22c55e" }} />
        <span style={{ fontSize: 12, color: "#64748b" }}>IDBI Bank &nbsp;•&nbsp; RBI AA Compliant &nbsp;•&nbsp; IDBI Innovate 2026</span>
      </div>

      {/* Logo + Title */}
      <div style={{ textAlign: "center", marginBottom: 44, zIndex: 1 }}>
        <div style={{
          width: 84, height: 84, borderRadius: 24, margin: "0 auto 20px",
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 40,
          boxShadow: "0 0 0 1px #3b82f633, 0 0 60px #3b82f644",
        }}>📊</div>

        <h1 style={{
          fontSize: 48, fontWeight: 900, color: "#f1f5f9",
          letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 14,
        }}>
          FinHealth{" "}
          <span style={{
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>AI</span>
        </h1>

        <p style={{ fontSize: 17, color: "#64748b", maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
          Instant MSME Financial Health Scores powered by GST, UPI, AA Framework & ML — no documents needed.
        </p>
      </div>

      {/* Stats strip */}
      <div style={{
        display: "flex", gap: 0,
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 16, overflow: "hidden",
        marginBottom: 44, zIndex: 1,
      }}>
        {STATS.map((s, i) => (
          <div key={i} style={{
            padding: "16px 32px", textAlign: "center",
            borderRight: i < STATS.length - 1 ? "1px solid #334155" : "none",
          }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: "#f1f5f9" }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#475569", marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Role Cards */}
      <p style={{ color: "#475569", fontSize: 12, letterSpacing: 2, marginBottom: 20, zIndex: 1 }}>
        SELECT YOUR ROLE TO CONTINUE
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 700, width: "100%", zIndex: 1 }}>

        {/* MSME Card */}
        <div
          onClick={() => onSelect("msme")}
          style={{
            background: "linear-gradient(135deg, #1e293b, #0f1f3d)",
            border: "1px solid #1e3a5f",
            borderRadius: 24, padding: 36,
            cursor: "pointer", transition: "all 0.3s",
            position: "relative", overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 24px 48px #3b82f622";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#1e3a5f";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{
            position: "absolute", top: -20, right: -20,
            width: 120, height: 120,
            background: "radial-gradient(circle, #3b82f622 0%, transparent 70%)",
            borderRadius: "50%",
          }} />
          <div style={{
            width: 60, height: 60, borderRadius: 18, marginBottom: 20,
            background: "#3b82f618", border: "1px solid #3b82f633",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28,
          }}>🏭</div>
          <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>BUSINESS OWNER</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 10, lineHeight: 1.2 }}>
            Check Loan Eligibility
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7, marginBottom: 20 }}>
            Get your Financial Health Score instantly using your GSTIN. No documents. No branch visits.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {["GST Data", "Bank Statements", "EPFO Records"].map((t) => (
              <span key={t} style={{
                fontSize: 11, color: "#3b82f6", background: "#3b82f611",
                border: "1px solid #3b82f622", padding: "3px 10px", borderRadius: 20,
              }}>{t}</span>
            ))}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 13, color: "#3b82f6", fontWeight: 700,
          }}>
            Get My Score <span style={{ fontSize: 16 }}>→</span>
          </div>
        </div>

        {/* Banker Card */}
        <div
          onClick={() => onSelect("banker")}
          style={{
            background: "linear-gradient(135deg, #1e293b, #1a0f3d)",
            border: "1px solid #2d1f5e",
            borderRadius: 24, padding: 36,
            cursor: "pointer", transition: "all 0.3s",
            position: "relative", overflow: "hidden",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#8b5cf6";
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 24px 48px #8b5cf622";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#2d1f5e";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{
            position: "absolute", top: -20, right: -20,
            width: 120, height: 120,
            background: "radial-gradient(circle, #8b5cf622 0%, transparent 70%)",
            borderRadius: "50%",
          }} />
          <div style={{
            width: 60, height: 60, borderRadius: 18, marginBottom: 20,
            background: "#8b5cf618", border: "1px solid #8b5cf633",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28,
          }}>🏦</div>
          <div style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>BANK OFFICER</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 10, lineHeight: 1.2 }}>
            Review Applications
          </h2>
          <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.7, marginBottom: 20 }}>
            AI-scored credit reports with SHAP explanations. Make faster, fairer lending decisions.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {["XGBoost ML", "SHAP Explainer", "6 Loan Products"].map((t) => (
              <span key={t} style={{
                fontSize: 11, color: "#8b5cf6", background: "#8b5cf611",
                border: "1px solid #8b5cf622", padding: "3px 10px", borderRadius: 20,
              }}>{t}</span>
            ))}
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 13, color: "#8b5cf6", fontWeight: 700,
          }}>
            Open Dashboard <span style={{ fontSize: 16 }}>→</span>
          </div>
        </div>
      </div>

      {/* Data sources strip */}
      <div style={{ display: "flex", gap: 28, marginTop: 44, flexWrap: "wrap", justifyContent: "center", zIndex: 1 }}>
        {DATA_SOURCES.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#334155" }}>
            <span style={{ fontSize: 14 }}>{s.icon}</span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
