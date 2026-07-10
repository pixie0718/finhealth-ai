import React, { useEffect, useState } from "react";
import { getHistory, getDemoScore, getAllOutcomes, getApplications, setApplicationStatus, getScore } from "../api/client";
import useIsMobile from "../hooks/useIsMobile";
import PortfolioAnalytics from "../components/PortfolioAnalytics";
import EmptyState from "../components/EmptyState";
import LoadingCard from "../components/LoadingCard";

const appStatusColors = {
  SUBMITTED: "#fbbf24", UNDER_REVIEW: "#3b82f6", APPROVED: "#22c55e", REJECTED: "#ef4444",
};

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

const DEMO_APPLICATIONS = [
  {
    reference: "APP-2024-001",
    msme_id: "demo-growth-001",
    business_name: "Sharma Textiles Pvt. Ltd.",
    loan_amount: 5000000,
    product: "Business Loan",
    status: "SUBMITTED",
  },
  {
    reference: "APP-2024-002",
    msme_id: "demo-ntc-002",
    business_name: "Fresh Foods Cooperative",
    loan_amount: 2000000,
    product: "Mudra Kishore",
    status: "UNDER_REVIEW",
  },
];

const DEMO_RECORDS = [
  {
    msme_id: "demo-growth-001",
    business_name: "Sharma Textiles Pvt. Ltd.",
    gstin: "27AAPFU0939F1ZV",
    city: "Surat",
    business_type: "Textile",
    years_in_business: 8,
    pillar_scores: { cash_flow: 82, compliance: 91, growth: 76, stability: 84, credit_worthiness: 79, overall: 82.4 },
    loan_eligibility: { eligible_loan_amount: 5000000, risk_band: "LOW", recommendation: "APPROVE", products: {} },
    ml_prediction: { prediction: "CREDITWORTHY", confidence: 0.94 },
    explanations: { strengths: [], risks: [], top_drivers: [] },
    generated_at: new Date().toISOString(),
    monthly_revenues: [850000, 920000, 980000, 1050000],
    monthly_inflows: [900000, 950000, 1000000, 1080000],
  },
  {
    msme_id: "demo-ntc-002",
    business_name: "Fresh Foods Cooperative",
    gstin: "19AACCU1234F2Z5",
    city: "Delhi",
    business_type: "Food Processing",
    years_in_business: 2,
    pillar_scores: { cash_flow: 68, compliance: 72, growth: 65, stability: 62, credit_worthiness: null, overall: 66.75 },
    loan_eligibility: { eligible_loan_amount: 2000000, risk_band: "MEDIUM", recommendation: "UNDER_REVIEW", products: {} },
    ml_prediction: { prediction: "UNDER_REVIEW", confidence: 0.72 },
    explanations: { strengths: [], risks: [], top_drivers: [] },
    generated_at: new Date().toISOString(),
    monthly_revenues: [450000, 520000, 580000, 650000],
    monthly_inflows: [480000, 560000, 620000, 700000],
  },
];

export default function Dashboard({ onView }) {
  const isMobile = useIsMobile();
  const [records, setRecords] = useState(DEMO_RECORDS);
  const [outcomeStats, setOutcomeStats] = useState(null);
  const [applications, setApplications] = useState(DEMO_APPLICATIONS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [demoing, setDemoing] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getHistory()
      .then((r) => setRecords(r.data))
      .catch(() => {
        setError(true);
        setRecords(DEMO_RECORDS);
      })
      .finally(() => setLoading(false));
    getAllOutcomes()
      .then((r) => setOutcomeStats(r.data?.stats || null))
      .catch(() => {});
    getApplications()
      .then((r) => setApplications(r.data?.applications || DEMO_APPLICATIONS))
      .catch(() => setApplications(DEMO_APPLICATIONS));
  };

  const refreshLive = () => {
    getApplications().then((r) => setApplications(r.data?.applications || [])).catch(() => {});
    getAllOutcomes().then((r) => setOutcomeStats(r.data?.stats || null)).catch(() => {});
  };

  useEffect(() => { load(); }, []);

  // Poll applications/outcomes so new submissions appear live without a reload.
  useEffect(() => {
    const id = setInterval(refreshLive, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emptyRecord = (a) => ({
    _appRef: a.reference, _appData: a, business_name: a.business_name,
    pillar_scores: { cash_flow: 0, compliance: 0, growth: 0, stability: 0, credit_worthiness: 0, overall: 0 },
    loan_eligibility: { eligible_loan_amount: 0, risk_band: "UNKNOWN" },
    ml_prediction: {}, explanations: { strengths: [], risks: [], top_drivers: [] },
    monthly_revenues: [], monthly_inflows: [], recommendations: [],
  });

  // The banker's own `records` (getHistory) only holds scores generated under
  // their account, so most incoming applications won't have a linkedRecord —
  // fetch the actual score by msme_id instead of showing an empty card.
  const viewApplication = async (a, linkedRecord) => {
    if (linkedRecord) { onView({ ...linkedRecord, _appRef: a.reference, _appData: a }); return; }
    try {
      const res = await getScore(a.msme_id);
      onView({ ...res.data, _appRef: a.reference, _appData: a });
    } catch {
      onView(emptyRecord(a));
    }
  };

  const updateApp = async (reference, status) => {
    // optimistic update, then refresh
    setApplications((apps) => apps.map((a) => (a.reference === reference ? { ...a, status } : a)));
    try {
      await setApplicationStatus(reference, status);
      getApplications().then((r) => setApplications(r.data?.applications || [])).catch(() => {});
    } catch {
      alert("Couldn't update application status.");
    }
  };

  const runDemo = async () => {
    setDemoing(true);
    try {
      // Try backend first, if fails use local demo
      try {
        const res = await getDemoScore();
        setRecords((prev) => [res.data, ...prev]);
        onView(res.data);
      } catch {
        // Fallback: Generate demo score locally
        const demoScore = {
          msme_id: "demo-" + Math.random().toString(36).substring(7),
          business_name: "Demo Business Ltd",
          gstin: "27AAPFU0939F1ZV",
          has_gstin: true,
          business_type: "Manufacturing",
          city: "Mumbai",
          years_in_business: 5,
          ntc_flag: false,
          ntb_flag: false,
          pillar_scores: {
            cash_flow: 78,
            compliance: 85,
            growth: 72,
            stability: 80,
            credit_worthiness: 76,
            overall: 78.2
          },
          loan_eligibility: {
            eligible_loan_amount: 5000000,
            risk_band: "LOW",
            multiplier_used: 1.0,
            recommendation: "APPROVE"
          },
          ml_prediction: { prediction: "CREDITWORTHY", confidence: 0.89 },
          explanations: { strengths: ["Strong compliance", "Good stability"], risks: [], top_drivers: ["cash_flow", "stability"] },
          recommendations: ["Approve for Business Loan", "Consider higher amount"],
          monthly_revenues: [900000, 950000, 1000000, 1050000, 1100000, 1150000],
          monthly_inflows: [950000, 1000000, 1050000, 1100000, 1150000, 1200000],
          data_sources: {},
          raw_features: {},
          generated_at: new Date().toISOString(),
        };
        setRecords((prev) => [demoScore, ...prev]);
        onView(demoScore);
      }
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
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--c-text)", letterSpacing: -0.5 }}>Banker Dashboard</h2>
          <p style={{ color: "#475569", fontSize: 13, marginTop: 5 }}>
            AI-powered credit intelligence • {records.length} applications processed
          </p>
        </div>
        <button onClick={runDemo} disabled={demoing} style={{
          padding: "12px 24px", borderRadius: 12,
          background: demoing ? "var(--c-surface-2)" : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
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

      {/* Portfolio analytics — score/risk/sector charts */}
      {!loading && !error && <PortfolioAnalytics records={records} />}

      {/* Portfolio Outcomes — post-disbursement loan quality */}
      {outcomeStats && outcomeStats.total > 0 && (
        <div style={{
          background: "var(--c-surface)", border: "1px solid var(--c-border)",
          borderRadius: 18, padding: "20px 24px", marginBottom: 32,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>📈 Portfolio Outcomes</div>
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
                background: "var(--c-bg)", border: "1px solid var(--c-border-soft)",
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
          background: "var(--c-surface)", border: "1px solid var(--c-border)",
          borderRadius: 18, padding: "20px 24px", marginBottom: 32,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>📥 Loan Applications</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 11, color: "#475569" }}>{applications.length} received</span>
              <button onClick={refreshLive} title="Refresh" style={{
                background: "transparent", border: "1px solid var(--c-border)", color: "#94a3b8",
                borderRadius: 8, padding: "3px 10px", fontSize: 11, cursor: "pointer",
              }}>↻ Refresh</button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {applications.slice(0, 8).map((a) => {
              const sc = appStatusColors[a.status] || "#64748b";
              const pending = a.status === "SUBMITTED" || a.status === "UNDER_REVIEW";
              const linkedRecord = records.find(r => r.msme_id === a.msme_id);
              return (
                <div key={a.reference} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  flexWrap: "wrap", gap: 10,
                  background: "var(--c-bg)", borderRadius: 10, padding: "10px 14px",
                }}>
                  <div style={{ minWidth: 150, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text-2)" }}>{a.business_name || "—"}</div>
                    <div style={{ fontSize: 11, color: "#475569" }}>{a.reference} • {a.product}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#93c5fd" }}>
                    ₹{((a.loan_amount || 0) / 100000).toFixed(1)}L
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: sc,
                    background: `${sc}18`, border: `1px solid ${sc}44`,
                    padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap",
                  }}>{a.status.replace("_", " ")}</div>
                  {pending ? (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => viewApplication(a, linkedRecord)} style={{
                        fontSize: 11, fontWeight: 700, cursor: "pointer",
                        color: "#3b82f6", background: "#3b82f622", border: "1px solid #3b82f655",
                        padding: "5px 12px", borderRadius: 8,
                      }}>📊 Details</button>
                      <button onClick={() => updateApp(a.reference, "APPROVED")} style={{
                        fontSize: 11, fontWeight: 700, cursor: "pointer",
                        color: "#22c55e", background: "#15803d22", border: "1px solid #15803d55",
                        padding: "5px 12px", borderRadius: 8,
                      }}>✓ Approve</button>
                      <button onClick={() => updateApp(a.reference, "REJECTED")} style={{
                        fontSize: 11, fontWeight: 700, cursor: "pointer",
                        color: "#f87171", background: "#dc262611", border: "1px solid #dc262655",
                        padding: "5px 12px", borderRadius: 8,
                      }}>✕ Reject</button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => viewApplication(a, linkedRecord)} style={{
                        fontSize: 11, fontWeight: 700, cursor: "pointer",
                        color: "#3b82f6", background: "#3b82f622", border: "1px solid #3b82f655",
                        padding: "5px 12px", borderRadius: 8,
                      }}>📊 Details</button>
                      <button onClick={() => updateApp(a.reference, "UNDER_REVIEW")} style={{
                        fontSize: 11, fontWeight: 600, cursor: "pointer",
                        color: "#94a3b8", background: "transparent", border: "1px solid var(--c-border)",
                        padding: "5px 12px", borderRadius: 8,
                      }}>Reopen</button>
                    </div>
                  )}
                </div>
              );
            })}
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
        <LoadingCard label="Loading applications..." />
      ) : records.length === 0 ? (
        <EmptyState
          icon="📊"
          title="No applications yet"
          message="Run a Demo Score or submit a new application to get started"
          actionLabel="⚡ Run Demo Score"
          onAction={runDemo}
          disabled={demoing}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {records.map((r) => {
            const color = riskColors[r.loan_eligibility?.risk_band] || "#64748b";
            const bg = riskBg[r.loan_eligibility?.risk_band] || "var(--c-surface)";
            const score = Math.round(r.pillar_scores?.overall ?? 0);
            const pillars = r.pillar_scores || {};

            return (
              <div key={r.msme_id}
                onClick={() => onView(r)}
                style={{
                  background: "var(--c-surface)",
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
                    <div style={{ fontWeight: 700, fontSize: 16, color: "var(--c-text)" }}>{r.business_name}</div>
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
                              background: "var(--c-bg)", overflow: "hidden",
                            }}>
                              <div style={{
                                width: `${val}%`, height: "100%",
                                background: p.color, borderRadius: 2,
                              }} />
                            </div>
                            <div style={{ fontSize: 8, color: "#64748b", marginTop: 2 }}>{p.label}</div>
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
                    <div style={{ fontSize: 22, fontWeight: 800, color: "var(--c-text)" }}>
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
                  <div style={{ fontSize: 11, color: "#64748b" }}>
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
