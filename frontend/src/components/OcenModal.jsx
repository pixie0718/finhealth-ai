import React from "react";

const fmt = (v) => (v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${Number(v || 0).toLocaleString("en-IN")}`);

const Row = ({ k, v, color }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "6px 0", borderBottom: "1px solid var(--c-border-strong)", fontSize: 12.5 }}>
    <span style={{ color: "#64748b" }}>{k}</span>
    <span style={{ color: color || "var(--c-text-2)", fontWeight: 600, textAlign: "right", wordBreak: "break-all" }}>{v}</span>
  </div>
);

export default function OcenModal({ ocen, onClose }) {
  const req = ocen.request;
  const res = ocen.response;
  const approved = res.bankDecision.status === "APPROVED";
  const dColor = approved ? "#22c55e" : "#f59e0b";

  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{
      position: "fixed", inset: 0, zIndex: 2000, background: "#000000aa", backdropFilter: "blur(5px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "#0b1220", border: "1px solid var(--c-border)", borderRadius: 20,
        width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto", padding: 28, position: "relative",
      }}>
        <button onClick={onClose} aria-label="Close" style={{
          position: "absolute", top: 14, right: 16, background: "transparent", border: "none",
          color: "#64748b", fontSize: 20, cursor: "pointer",
        }}>✕</button>

        {/* header */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, color: "#818cf8", fontWeight: 700, marginBottom: 4 }}>OCEN 2.0 · CREDIT REQUEST</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--c-text)" }}>Submitted to IDBI Bank OCEN Node</h2>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Request ID: <span style={{ color: "#93c5fd" }}>{req.requestId}</span></div>
        </div>

        {/* flow strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 11.5, color: "#94a3b8" }}>
          <span style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", padding: "6px 12px", borderRadius: 20 }}>📊 FinHealth AI</span>
          <span style={{ color: "#475569" }}>→</span>
          <span style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", padding: "6px 12px", borderRadius: 20 }}>🔗 OCEN Node</span>
          <span style={{ color: "#475569" }}>→</span>
          <span style={{ background: `${dColor}18`, border: `1px solid ${dColor}55`, color: dColor, fontWeight: 700, padding: "6px 12px", borderRadius: 20 }}>🏦 {res.bankDecision.status.replace("_", " ")}</span>
        </div>

        {/* decision banner */}
        <div style={{ background: `${dColor}12`, border: `1px solid ${dColor}44`, borderRadius: 14, padding: "16px 18px", marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 1 }}>BANK DECISION</div>
              <div style={{ fontSize: 20, fontWeight: 900, color: dColor }}>{res.bankDecision.status.replace("_", " ")}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#64748b" }}>Recommended amount</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--c-text)" }}>{fmt(res.bankDecision.recommendedAmount)}</div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>➜ {res.bankDecision.nextStep} · processed in {res.bankDecision.processingTimeMinutes} min</div>
        </div>

        {/* request payload */}
        <div style={{ background: "var(--c-bg)", border: "1px solid var(--c-border-soft)", borderRadius: 12, padding: "14px 18px", marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "#818cf8", letterSpacing: 1, fontWeight: 700, marginBottom: 8 }}>CREDIT REQUEST PAYLOAD</div>
          <Row k="GSTIN" v={req.creditRequest.gstin} />
          <Row k="Business" v={req.creditRequest.businessName} />
          <Row k="Requested amount" v={fmt(req.creditRequest.requestedAmount)} />
          <Row k="Overall score" v={req.creditAssessment.overallScore} color="#93c5fd" />
          <Row k="Risk band" v={req.creditAssessment.riskBand} />
          <Row k="Consent ID" v={req.borrowerConsentId} />
          <Row k="Data sources" v={req.creditAssessment.dataSourcesUsed.join(", ")} />
        </div>

        {/* node meta */}
        <div style={{ fontSize: 11.5, color: "#64748b", textAlign: "center" }}>
          🔒 {res.node.name} · {res.node.protocol} · SANDBOX · received {new Date(res.receivedAt).toLocaleString("en-IN")}
        </div>
      </div>
    </div>
  );
}
