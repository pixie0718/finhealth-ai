import React, { useState, useEffect } from "react";
import RevenueChart from "../components/RevenueChart";
import ScoreSimulator from "../components/ScoreSimulator";
import EMICalculator from "../components/EMICalculator";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

const getColor  = s => s >= 75 ? "#10b981" : s >= 60 ? "#f59e0b" : "#ef4444";
const getGrade  = s => s >= 75 ? "A" : s >= 60 ? "B" : "C";
const getLabel  = s => s >= 75 ? "Excellent" : s >= 60 ? "Good" : "Fair";
const riskColor = { LOW:"#10b981",MEDIUM:"#f59e0b",HIGH:"#ef4444" };
const fmtL = v => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${Math.round(v).toLocaleString("en-IN")}`;

export default function MSMEResult({ result, onReset }) {
  const isMobile = useIsMobile();
  const score = result.pillar_scores.overall;
  const color = getColor(score);
  const grade = getGrade(score);
  const label = getLabel(score);
  const loan = result.loan_eligibility;
  const lc = riskColor[loan.risk_band] || "#9ca3af";
  const ps = result.pillar_scores;
  const ml = result.ml_prediction;

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#e5e7eb" }}>
      {/* Sticky Header */}
      <div style={{
        background: "rgba(15, 23, 42, 0.95)", backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
        padding: "16px 0", position: "sticky", top: 0, zIndex: 50
      }}>
        <div style={{
          maxWidth: 1400, margin: "0 auto", padding: "0 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>
              {result.business_name}
            </h1>
            <p style={{ fontSize: 12, color: "#94a3b8", margin: "4px 0 0 0" }}>
              Financial Health Analysis
            </p>
          </div>
          <button onClick={onReset} style={{
            padding: "8px 16px", fontSize: 12, fontWeight: 600,
            background: "rgba(148, 163, 184, 0.1)", border: "1px solid rgba(148, 163, 184, 0.3)",
            borderRadius: 6, cursor: "pointer", color: "#94a3b8",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(148, 163, 184, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(148, 163, 184, 0.1)";
          }}
          >
            ← Back
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "32px 24px" }}>

        {/* Hero Score Section */}
        <div style={{
          background: "linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%)",
          border: `1px solid rgba(${color === "#10b981" ? "16, 185, 129" : color === "#f59e0b" ? "245, 158, 11" : "239, 68, 68"}, 0.3)`,
          borderRadius: 16, padding: isMobile ? "24px" : "40px",
          marginBottom: 32, backdropFilter: "blur(10px)"
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 1fr",
            gap: isMobile ? 24 : 48,
            alignItems: "center"
          }}>

            {/* Left: Business Info */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>
                Business Information
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>Type</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>
                  {result.business_type}
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>Location</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>
                  {result.city}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>Experience</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>
                  {result.years_in_business} years
                </div>
              </div>
            </div>

            {/* Center: Score */}
            <div style={{
              textAlign: "center",
              paddingLeft: isMobile ? 0 : 32,
              paddingRight: isMobile ? 0 : 32,
              borderLeft: isMobile ? "none" : `1px solid rgba(148, 163, 184, 0.2)`,
              borderRight: isMobile ? "none" : `1px solid rgba(148, 163, 184, 0.2)`
            }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1
              }}>
                Health Score
              </div>
              <div style={{
                fontSize: 64, fontWeight: 900, color: color, lineHeight: 1, marginBottom: 12
              }}>
                {Math.round(score)}
              </div>
              <div style={{
                fontSize: 14, fontWeight: 700, color: "#e5e7eb", marginBottom: 12, lineHeight: 1.2
              }}>
                Grade <span style={{ color: color, fontSize: 22, fontWeight: 900 }}>{grade}</span>
              </div>
              <div style={{
                fontSize: 13, color: "#94a3b8", marginBottom: 16
              }}>
                {label}
              </div>
              <div style={{
                display: "inline-block", padding: "8px 16px", borderRadius: 8,
                background: `${color}20`, border: `1px solid ${color}50`,
                fontSize: 12, fontWeight: 700, color: color, textTransform: "uppercase"
              }}>
                {loan.risk_band} Risk
              </div>
            </div>

            {/* Right: Loan */}
            <div style={{ textAlign: "right" }}>
              <div style={{
                fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1
              }}>
                Loan Eligible
              </div>
              <div style={{
                fontSize: isMobile ? 36 : 48, fontWeight: 900,
                color: lc, lineHeight: 1, marginBottom: 12
              }}>
                {fmtL(loan.eligible_loan_amount)}
              </div>
              <div style={{
                display: "inline-block", padding: "10px 20px", borderRadius: 8,
                background: lc, color: "#ffffff", fontWeight: 700, fontSize: 12, textTransform: "uppercase"
              }}>
                {loan.recommendation}
              </div>
            </div>
          </div>
        </div>

        {/* 5 Pillars */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 16, margin: 0 }}>
            Five Pillar Breakdown
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)",
            gap: 12
          }}>
            {[
              { label: "Cash Flow", icon: "💧", key: "cash_flow" },
              { label: "Compliance", icon: "📋", key: "compliance" },
              { label: "Growth", icon: "📈", key: "growth" },
              { label: "Stability", icon: "🏛️", key: "stability" },
              { label: "Credit", icon: "💳", key: "credit_worthiness" }
            ].map(p => {
              const sc = ps[p.key];
              const col = sc === null ? "#9ca3af" : sc >= 75 ? "#10b981" : sc >= 60 ? "#f59e0b" : "#ef4444";
              return (
                <div key={p.key} style={{
                  background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(148, 163, 184, 0.2)",
                  borderRadius: 12, padding: 20, textAlign: "center",
                  transition: "all 0.2s", cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(30, 41, 59, 0.9)";
                  e.currentTarget.style.borderColor = `${col}50`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(30, 41, 59, 0.6)";
                  e.currentTarget.style.borderColor = "rgba(148, 163, 184, 0.2)";
                }}
                >
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{p.icon}</div>
                  <div style={{
                    fontSize: 32, fontWeight: 900, color: col, lineHeight: 1, marginBottom: 8
                  }}>
                    {sc === null ? "—" : Math.round(sc)}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>
                    {p.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two Column: Data + ML */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 16, marginBottom: 32
        }}>
          {/* Data Sources */}
          {result.data_sources && Object.keys(result.data_sources).length > 0 && (
            <div style={{
              background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: 12, padding: 20
            }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", marginBottom: 16, margin: 0, textTransform: "uppercase" }}>
                Data Sources
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {Object.entries(result.data_sources).map(([key, src]) => (
                  <span key={key} style={{
                    padding: "6px 12px", background: "rgba(148, 163, 184, 0.1)",
                    border: "1px solid rgba(148, 163, 184, 0.2)", borderRadius: 8,
                    fontSize: 12, fontWeight: 600, color: "#94a3b8"
                  }}>
                    ✓ {src.source}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ML Prediction */}
          <div style={{
            background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: 12, padding: 20
          }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", marginBottom: 16, margin: 0, textTransform: "uppercase" }}>
              ML Assessment
            </h3>
            <div style={{
              padding: 16,
              background: ml.prediction === "CREDITWORTHY" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${ml.prediction === "CREDITWORTHY" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`,
              borderRadius: 8
            }}>
              <div style={{
                fontSize: 12, fontWeight: 700,
                color: ml.prediction === "CREDITWORTHY" ? "#10b981" : "#ef4444",
                marginBottom: 8, textTransform: "uppercase"
              }}>
                {ml.prediction === "CREDITWORTHY" ? "✓ Creditworthy" : "⚠ " + ml.prediction}
              </div>
              <div style={{
                fontSize: 28, fontWeight: 900,
                color: ml.prediction === "CREDITWORTHY" ? "#10b981" : "#ef4444",
                lineHeight: 1, marginBottom: 6
              }}>
                {(ml.confidence * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8" }}>
                Confidence Score
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Risks */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 16, marginBottom: 32
        }}>
          {/* Strengths */}
          <div style={{
            background: "rgba(16, 185, 129, 0.08)", border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: 12, padding: 20
          }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: "#10b981", marginBottom: 14, margin: 0, textTransform: "uppercase" }}>
              ✨ Strengths
            </h3>
            {(result.explanations?.strengths || []).length === 0 ? (
              <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>Strong profile. No issues noted.</p>
            ) : (
              (result.explanations?.strengths || []).map((s, i) => (
                <div key={i} style={{ fontSize: 13, color: "#e5e7eb", marginBottom: 10, paddingLeft: 12 }}>
                  • {s.label}
                </div>
              ))
            )}
          </div>

          {/* Risks */}
          <div style={{
            background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: 12, padding: 20
          }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: "#ef4444", marginBottom: 14, margin: 0, textTransform: "uppercase" }}>
              ⚠️ Areas to Improve
            </h3>
            {(result.explanations?.risks || []).length === 0 ? (
              <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>No major risks detected.</p>
            ) : (
              (result.explanations?.risks || []).map((r, i) => (
                <div key={i} style={{ fontSize: 13, color: "#e5e7eb", marginBottom: 10, paddingLeft: 12 }}>
                  • {r.label}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Charts Section */}
        {result.monthly_revenues?.length > 0 && (
          <div style={{
            background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: 12, padding: 24, marginBottom: 24
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 20, margin: 0 }}>
              Revenue Trend
            </h3>
            <RevenueChart revenues={result.monthly_revenues} inflows={result.monthly_inflows} />
          </div>
        )}

        {/* EMI Calculator */}
        <div style={{
          background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(148, 163, 184, 0.2)",
          borderRadius: 12, padding: 24, marginBottom: 24
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 20, margin: 0 }}>
            EMI Calculator
          </h3>
          <EMICalculator products={loan.products} />
        </div>

        {/* Score Simulator */}
        {result.raw_features && (
          <div id="r-simulator" style={{
            background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: 12, padding: 24, marginBottom: 24
          }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9", marginBottom: 20, margin: 0 }}>
              Score Simulator
            </h3>
            <ScoreSimulator rawFeatures={result.raw_features} currentScores={ps} />
          </div>
        )}

      </div>
    </div>
  );
}
