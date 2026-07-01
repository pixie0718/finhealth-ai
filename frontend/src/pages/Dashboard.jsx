import React, { useEffect, useState } from "react";
import { getHistory, getDemoScore, getAllOutcomes, getApplications } from "../api/client";
import useIsMobile from "../hooks/useIsMobile";

const riskColors = {
  "LOW": "#22c55e",
  "MEDIUM-LOW": "#eab308",
  "MEDIUM": "#f97316",
  "HIGH": "#ef4444",
};

const riskBg = {
  "LOW": "#15803d22",
  "MEDIUM-LOW": "#ca8a0422",
  "MEDIUM": "#ea580c22",
  "HIGH": "#dc262622",
};

export default function Dashboard({ onView }) {
  const isMobile = useIsMobile();
  const [records, setRecords] = useState([]);
  const [outcomeStats, setOutcomeStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [demoing, setDemoing] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getHistory()
      .then((r) => setRecords(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    getAllOutcomes()
      .then((r) => setOutcomeStats(r.data?.stats || null))
      .catch(() => {});
    getApplications()
      .then((r) => setApplications(r.data?.applications || []))
      .catch(() => {});
  };

  useEffect(() => { load(); }, []);

  const runDemo = async () => {
    setDemoing(true);
    try {
      const res = await getDemoScore();
      setRecords((prev) => [res.data, ...prev]);
      onView(res.data);
    } catch {
      alert("Backend not reachable");
    } finally {
      setDemoing(false);
    }
  };

  const avg = records.length
    ? (records.reduce((a, r) => a + (r.pillar_scores?.overall ?? 0), 0) / records.length).toFixed(1)
    : 0;
  const lowRisk = records.filter(r => r.loan_eligibility?.risk_band === "LOW").length;
  const totalPortfolio = records.reduce((a, r) => a + (r.loan_eligibility?.eligible_loan_amount ?? 0), 0);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 24px" }}>

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", letterSpacing: -0.5 }}>Banker Dashboard</h2>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 5 }}>
            AI-powered credit intelligence • {records.length} applications processed
          </p>
        </div>
        <button onClick={runDemo} disabled={demoing} style={{
          padding: "12px 24px", borderRadius: 12,
          background: demoing ? "#334155" : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          border: "none", color: "#fff", fontSize: 14, fontWeight: 700,
          cursor: demoing ? "not-allowed" : "pointer",
          boxShadow: demoing ? "none" : "0 4px 20px #3b82f644",
          transition: "all 0.2s",
        }}>
          {demoing ? "⏳ Computing..." : "⚡ Run Demo Score"}
        </button>
      </div>

      {/* Hero Stats */}
      {records.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          {[
            {
              label: "TOTAL APPLICATIONS",
              value: records.length,
              sub: "All time",
              icon: "📋",
              color: "#3b82f6",
              bg: "#3b82f611",
              border: "#3b82f622",
            },
            {
              label: "AVERAGE SCORE",
              value: avg,
              sub: "Across all MSMEs",
              icon: "📊",
              color: "#8b5cf6",
              bg: "#8b5cf611",
              border: "#8b5cf622",
            },
            {
              label: "LOW RISK APPROVALS",
              value: `${lowRisk} / ${records.length}`,
              sub: `${records.length ? ((lowRisk / records.length) * 100).toFixed(0) : 0}% approval rate`,
              icon: "✅",
              color: "#22c55e",
              bg: "#15803d11",
              border: "#15803d22",
            },
            {
              label: "TOTAL LOAN PORTFOLIO",
              value: `₹${(totalPortfolio / 10000000).toFixed(1)}Cr`,
              sub: "Eligible loan amount",
              icon: "💰",
              color: "#f59e0b",
              bg: "#f59e0b11",
              border: "#f59e0b22",
            },
          ].map((s, i) => (
            <div key={i} style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 18,
              padding: "20px 22px",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: -10, right: -10,
                fontSize: 52, opacity: 0.08,
              }}>{s.icon}</div>
              <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1.5, marginBottom: 10 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 8 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Portfolio Outcomes — post-disbursement loan quality */}
      {outcomeStats && outcomeStats.total > 0 && (
        <div style={{
          background: "#1e293b", border: "1px solid #334155",
          borderRadius: 18, padding: "20px 24px", marginBottom: 32,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>📈 Portfolio Outcomes</div>
            <div style={{ fontSize: 11, color: "#475569" }}>{outcomeStats.total} tracked</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 14 }}>
            {[
              { label: "NPA RATE", value: `${outcomeStats.npa_rate}%`, color: outcomeStats.npa_rate > 5 ? "#ef4444" : "#22c55e" },
              { label: "REPAID", value: outcomeStats.repaid ?? 0, color: "#22c55e" },
              { label: "ACTIVE", value: outcomeStats.active ?? 0, color: "#3b82f6" },
              { label: "NPA", value: outcomeStats.npa ?? 0, color: "#ef4444" },
            ].map((s) => (
              <div key={s.label} style={{
                background: "#0f172a", border: "1px solid #1e293b",
                borderRadius: 12, padding: "14px 16px",
              }}>
                <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incoming loan applications */}
      {applications.length > 0 && (
        <div style={{
          background: "#1e293b", border: "1px solid #334155",
          borderRadius: 18, padding: "20px 24px", marginBottom: 32,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>📥 Loan Applications</div>
            <div style={{ fontSize: 11, color: "#475569" }}>{applications.length} received</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {applications.slice(0, 6).map((a) => (
              <div key={a.reference} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                flexWrap: "wrap", gap: 8,
                background: "#0f172a", borderRadius: 10, padding: "10px 14px",
              }}>
                <div style={{ minWidth: 160 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{a.business_name || "—"}</div>
                  <div style={{ fontSize: 11, color: "#475569" }}>{a.reference} • {a.product}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#93c5fd" }}>
                  ₹{((a.loan_amount || 0) / 100000).toFixed(1)}L
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 700, color: "#fbbf24",
                  background: "#78350f33", border: "1px solid #92400e55",
                  padding: "3px 10px", borderRadius: 20,
                }}>{a.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error ? (
        <div style={{
          textAlign: "center", padding: 64,
          background: "#1c1010", borderRadius: 20, border: "1px solid #dc262633",
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <div style={{ color: "#fca5a5", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Couldn't reach the server</div>
          <div style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>
            Make sure the backend is running on port 8000, then retry.
          </div>
          <button onClick={load} style={{
            padding: "10px 24px", borderRadius: 10, border: "1px solid #ef444455",
            background: "#dc262611", color: "#f87171", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>↻ Retry</button>
        </div>
      ) : loading ? (
        <div style={{
          textAlign: "center", padding: 80, color: "#475569",
          background: "#1e293b", borderRadius: 20, border: "1px solid #334155",
        }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          Loading applications...
        </div>
      ) : records.length === 0 ? (
        <div style={{
          background: "linear-gradient(135deg, #1e293b, #0f172a)",
          border: "1px solid #334155",
          borderRadius: 24, padding: 64, textAlign: "center",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20, margin: "0 auto 20px",
            background: "linear-gradient(135deg, #3b82f622, #8b5cf622)",
            border: "1px solid #3b82f633",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32,
          }}>📊</div>
          <div style={{ color: "#f1f5f9", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No applications yet</div>
          <div style={{ color: "#64748b", fontSize: 14, marginBottom: 24 }}>
            Run a Demo Score or submit a new application to get started
          </div>
          <button onClick={runDemo} disabled={demoing} style={{
            padding: "12px 28px", borderRadius: 12,
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 4px 20px #3b82f644",
          }}>
            ⚡ Run Demo Score
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {records.map((r) => {
            const color = riskColors[r.loan_eligibility?.risk_band] || "#64748b";
            const bg = riskBg[r.loan_eligibility?.risk_band] || "#1e293b";
            const score = Math.round(r.pillar_scores?.overall ?? 0);
            const pillars = r.pillar_scores || {};

            return (
              <div key={r.msme_id}
                onClick={() => onView(r)}
                style={{
                  background: "#1e293b",
                  border: "1px solid #1e3a5f",
                  borderRadius: 18,
                  padding: "20px 26px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between", flexWrap: "wrap", gap: 16,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = color;
                  e.currentTarget.style.boxShadow = `0 4px 24px ${color}22`;
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#1e3a5f";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Left: score badge + name */}
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: `${color}18`,
                    border: `2px solid ${color}55`,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    boxShadow: `0 0 16px ${color}22`,
                  }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color, lineHeight: 1 }}>{score}</div>
                    <div style={{ fontSize: 8, color: "#475569", letterSpacing: 0.5 }}>/ 100</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#f1f5f9" }}>{r.business_name}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                      📍 {r.city} &nbsp;•&nbsp; 🏭 {r.business_type} &nbsp;•&nbsp; ⏱ {r.years_in_business} yrs
                    </div>
                    {/* Mini pillar bars */}
                    <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                      {[
                        { key: "cash_flow", label: "CF", color: "#3b82f6" },
                        { key: "compliance", label: "CO", color: "#8b5cf6" },
                        { key: "growth", label: "GR", color: "#06b6d4" },
                        { key: "stability", label: "ST", color: "#f59e0b" },
                        { key: "credit_worthiness", label: "CR", color: "#ec4899" },
                      ].map((p) => {
                        const val = pillars[p.key] ?? 0;
                        return (
                          <div key={p.key} style={{ textAlign: "center" }}>
                            <div style={{
                              width: 28, height: 4, borderRadius: 2,
                              background: "#0f172a", overflow: "hidden",
                            }}>
                              <div style={{
                                width: `${val}%`, height: "100%",
                                background: p.color, borderRadius: 2,
                              }} />
                            </div>
                            <div style={{ fontSize: 8, color: "#334155", marginTop: 2 }}>{p.label}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right: loan + badge */}
                <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 3 }}>LOAN ELIGIBLE</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>
                      ₹{((r.loan_eligibility?.eligible_loan_amount ?? 0) / 100000).toFixed(1)}L
                    </div>
                  </div>
                  <div style={{
                    padding: "6px 16px", borderRadius: 24,
                    background: bg,
                    border: `1px solid ${color}44`,
                    fontSize: 12, fontWeight: 700, color,
                    letterSpacing: 0.5,
                  }}>
                    {r.loan_eligibility?.risk_band}
                  </div>
                  <div style={{ fontSize: 11, color: "#334155" }}>
                    {new Date(r.generated_at).toLocaleDateString("en-IN")}
                  </div>
                  <div style={{
                    color: color, fontSize: 14, fontWeight: 700,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    View <span style={{ fontSize: 16 }}>→</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
