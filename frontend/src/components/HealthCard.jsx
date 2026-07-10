import React, { useRef, useState } from "react";
import useIsMobile from "../hooks/useIsMobile";
import { setApplicationStatus } from "../api/client";
import ScoreGauge from "./ScoreGauge";
import PillarBar from "./PillarBar";
import RevenueChart from "./RevenueChart";
import LoanProductsMatrix from "./LoanProductsMatrix";
import Recommendations from "./Recommendations";
import DetailedReports from "./DetailedReports";
import ScoreSimulator from "./ScoreSimulator";
import EMICalculator from "./EMICalculator";
import LoanApplyCTA from "./LoanApplyCTA";
import PeerBenchmark from "./PeerBenchmark";
import ScoreTrend from "./ScoreTrend";
import ConsentCard from "./ConsentCard";
import NTCBanner from "./NTCBanner";
import OutcomeModal from "./OutcomeModal";
import OcenModal from "./OcenModal";
import { submitToOcen } from "../api/client";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

const riskColors = {
  "LOW": "#22c55e",
  "MEDIUM-LOW": "#eab308",
  "MEDIUM": "#f97316",
  "HIGH": "#ef4444",
};

const recBg = {
  "APPROVE": "#15803d22",
  "RECOMMEND FOR REVIEW": "#ca8a0422",
  "MANUAL UNDERWRITING REQUIRED": "#ea580c22",
  "DECLINE": "#dc262622",
};

const appStatusColors = {
  SUBMITTED: "#fbbf24", UNDER_REVIEW: "#3b82f6", APPROVED: "#22c55e", REJECTED: "#ef4444",
};

const PRODUCT_LABELS = {
  msme_loan: "MSME Loan", working_capital: "Working Capital", business_loan: "Business Loan",
  personal_loan: "Personal Loan", auto_loan: "Auto Loan", home_loan: "Home Loan",
  mudra_shishu: "MUDRA Shishu", mudra_kishore: "MUDRA Kishore", mudra_tarun: "MUDRA Tarun",
  cgtmse_backed: "CGTMSE-Backed", standup_india: "Stand-Up India",
};

async function exportPDF(ref, business_name) {
  const { default: html2canvas } = await import("html2canvas");
  const { default: jsPDF } = await import("jspdf");
  // html2canvas's `backgroundColor` option runs through its own color parser, which
  // doesn't understand an unresolved "var(--c-bg)" string — resolve it to a real
  // color first, or the export throws "unsupported color function var".
  const resolvedBg = getComputedStyle(document.documentElement).getPropertyValue("--c-bg").trim() || "#ffffff";
  const canvas = await html2canvas(ref, { backgroundColor: resolvedBg, scale: 1.5, useCORS: true });
  const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width / 1.5, canvas.height / 1.5] });
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, canvas.width / 1.5, canvas.height / 1.5);
  pdf.save(`FinHealth-${business_name.replace(/\s+/g, "-")}.pdf`);
}

export default function HealthCard({ data, isManagerView = false }) {
  const printRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const [recordedOutcome, setRecordedOutcome] = useState(null);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);
  const [appStatus, setAppStatus] = useState(data._appData?.status || null);
  const [ocen, setOcen] = useState(null);        // OCEN request+response
  const [ocenLoading, setOcenLoading] = useState(false);

  const isMobile = useIsMobile();
  const { business_name, gstin, city, business_type, years_in_business,
    pillar_scores, loan_eligibility, ml_prediction, explanations, generated_at,
    monthly_revenues, monthly_inflows, recommendations, raw_features, _appRef, _appData } = data;

  const handleApprove = async () => {
    if (!_appRef) return;
    setApproving(true);
    try {
      await setApplicationStatus(_appRef, "APPROVED");
      setAppStatus("APPROVED");
      setActionMessage({ type: "success", text: "✓ Application Approved! Notification sent to owner." });
      setTimeout(() => setActionMessage(null), 4000);
    } catch {
      setActionMessage({ type: "error", text: "Failed to approve application" });
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!_appRef) return;
    setRejecting(true);
    try {
      await setApplicationStatus(_appRef, "REJECTED");
      setAppStatus("REJECTED");
      setActionMessage({ type: "error", text: "✗ Application Rejected. Notification sent to owner." });
      setTimeout(() => setActionMessage(null), 4000);
    } catch {
      setActionMessage({ type: "error", text: "Failed to reject application" });
    } finally {
      setRejecting(false);
    }
  };

  const handleReopen = async () => {
    if (!_appRef) return;
    setReopening(true);
    try {
      await setApplicationStatus(_appRef, "UNDER_REVIEW");
      setAppStatus("UNDER_REVIEW");
      setActionMessage({ type: "success", text: "↺ Application reopened for review." });
      setTimeout(() => setActionMessage(null), 4000);
    } catch {
      setActionMessage({ type: "error", text: "Failed to reopen application" });
    } finally {
      setReopening(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try { await exportPDF(printRef.current, business_name); }
    finally { setExporting(false); }
  };

  const handleOcen = async () => {
    setOcenLoading(true);
    try {
      const res = await submitToOcen(data.msme_id);
      setOcen(res.data);
    } catch (e) {
      alert(e?.response?.data?.detail || "Couldn't reach the OCEN node.");
    } finally {
      setOcenLoading(false);
    }
  };

  // NTC mode: credit_worthiness is null — replace with 0 so Recharts doesn't
  // generate NaN coordinates and collapse the radar chart.
  const radarData = [
    { subject: "Cash Flow", value: pillar_scores.cash_flow },
    { subject: "Compliance", value: pillar_scores.compliance },
    { subject: "Growth", value: pillar_scores.growth },
    { subject: "Stability", value: pillar_scores.stability },
    { subject: "Credit", value: pillar_scores.credit_worthiness ?? 0 },
  ];

  const riskColor = riskColors[loan_eligibility.risk_band] || "#94a3b8";
  const date = new Date(generated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const HC_SECTIONS = [
    { id: "hc-overview",   label: "Overview",    icon: "📊" },
    { id: "hc-reports",    label: "Reports",     icon: "📁" },
    { id: "hc-emi",        label: "EMI Calc",    icon: "💰" },
    { id: "hc-simulator",  label: "Simulator",   icon: "🎯" },
    { id: "hc-benchmark",  label: "Benchmarks",  icon: "📈" },
    ...(isManagerView ? [] : [{ id: "hc-apply",      label: "Apply",       icon: "✅" }]),
  ];

  return (
    <div ref={printRef} style={{ maxWidth: isMobile ? 720 : 1300, margin: "0 auto", padding: isMobile ? "24px 16px" : "24px 32px" }}>

      {/* Action Message Toast */}
      {actionMessage && (
        <div style={{
          padding: "12px 16px", borderRadius: 8, marginBottom: 16,
          background: actionMessage.type === "success" ? "#15803d22" : "#dc262622",
          border: `1px solid ${actionMessage.type === "success" ? "#22c55e44" : "#dc262655"}`,
          color: actionMessage.type === "success" ? "#22c55e" : "#f87171",
          fontSize: 13, fontWeight: 600,
        }}>
          {actionMessage.text}
        </div>
      )}

      {/* Quick-nav bar */}
      <div style={{
        position: "sticky", top: 60, zIndex: 50,
        background: "var(--c-header)", backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--c-border-soft)",
        display: "flex", gap: 6, padding: "10px 0", marginBottom: 20,
        overflowX: "auto",
      }}>
        {HC_SECTIONS.map(s => (
          <button key={s.id} onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" })} style={{
            padding: "6px 14px", borderRadius: 20, flexShrink: 0,
            background: "var(--c-surface)", border: "1px solid var(--c-border)",
            color: "#94a3b8", fontSize: 12, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
          }}>
            <span>{s.icon}</span> {s.label}
          </button>
        ))}
      </div>

      <div id="hc-overview" />

      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, var(--c-surface), var(--c-bg))",
        border: "1px solid var(--c-border)",
        borderRadius: 20,
        padding: "28px 32px",
        marginBottom: 20,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 0, right: 0, width: 200, height: 200,
          background: "radial-gradient(circle, #3b82f622 0%, transparent 70%)",
          borderRadius: "50%", transform: "translate(30%, -30%)",
        }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "#3b82f6", letterSpacing: 2, fontWeight: 600, marginBottom: 6 }}>
              MSME FINANCIAL HEALTH CARD
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--c-text)", marginBottom: 4 }}>{business_name}</h1>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 8 }}>
              <span style={{ fontSize: 12, color: "#64748b", background: "var(--c-surface)", padding: "3px 10px", borderRadius: 20 }}>{gstin}</span>
              <span style={{ fontSize: 12, color: "#64748b" }}>📍 {city}</span>
              <span style={{ fontSize: 12, color: "#64748b" }}>🏭 {business_type}</span>
              <span style={{ fontSize: 12, color: "#64748b" }}>⏱ {years_in_business} yrs in business</span>
            </div>
          </div>
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
            <div style={{ fontSize: 11, color: "#475569" }}>Generated: {date}</div>
            <div style={{
              padding: "6px 16px", borderRadius: 8,
              background: recBg[loan_eligibility.recommendation] || "var(--c-surface)",
              border: `1px solid ${riskColor}44`,
              fontSize: 12, fontWeight: 700, color: riskColor, letterSpacing: 0.5,
            }}>
              {loan_eligibility.recommendation}
            </div>
            <div style={{ display:"flex", gap:6, flexWrap: "wrap" }}>
              {isManagerView && _appRef && (
                appStatus === "APPROVED" || appStatus === "REJECTED" ? (
                  <>
                    <span style={{
                      padding: "6px 14px", borderRadius: 8,
                      background: appStatus === "APPROVED" ? "#15803d22" : "#dc262611",
                      border: `1px solid ${appStatus === "APPROVED" ? "#15803d55" : "#dc262655"}`,
                      color: appStatus === "APPROVED" ? "#22c55e" : "#f87171",
                      fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 5,
                    }}>
                      {appStatus === "APPROVED" ? "✓ Approved" : "✕ Rejected"}
                    </span>
                    <button onClick={handleReopen} disabled={reopening} style={{
                      padding: "6px 14px", borderRadius: 8,
                      background: "var(--c-surface)",
                      border: "1px solid var(--c-border)", color: "#94a3b8",
                      fontSize: 11, cursor: reopening ? "not-allowed" : "pointer",
                      fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
                    }}>
                      {reopening ? "⏳ Reopening…" : "↺ Reopen"}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={handleApprove} disabled={approving} style={{
                      padding: "6px 14px", borderRadius: 8,
                      background: approving ? "#15803d44" : "#15803d22",
                      border: "1px solid #15803d55", color: "#22c55e",
                      fontSize: 11, cursor: approving ? "not-allowed" : "pointer",
                      fontWeight: 700, display: "flex", alignItems: "center", gap: 5,
                    }}>
                      {approving ? "⏳ Approving…" : "✓ Approve"}
                    </button>
                    <button onClick={handleReject} disabled={rejecting} style={{
                      padding: "6px 14px", borderRadius: 8,
                      background: rejecting ? "#dc262644" : "#dc262611",
                      border: "1px solid #dc262655", color: "#f87171",
                      fontSize: 11, cursor: rejecting ? "not-allowed" : "pointer",
                      fontWeight: 700, display: "flex", alignItems: "center", gap: 5,
                    }}>
                      {rejecting ? "⏳ Rejecting…" : "✕ Reject"}
                    </button>
                  </>
                )
              )}
              <button onClick={() => setShowOutcome(true)} style={{
                padding: "6px 14px", borderRadius: 8,
                background: recordedOutcome ? "#22c55e22" : "var(--c-surface)",
                border: recordedOutcome ? "1px solid #22c55e44" : "1px solid var(--c-border)",
                color: recordedOutcome ? "#22c55e" : "#94a3b8",
                fontSize: 11, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                {recordedOutcome ? `✓ ${recordedOutcome}` : "📋 Mark Outcome"}
              </button>
              <button onClick={handleExport} disabled={exporting} style={{
                padding: "6px 14px", borderRadius: 8,
                background: exporting ? "var(--c-surface-2)" : "var(--c-surface)",
                border: "1px solid var(--c-border)", color: exporting ? "#475569" : "#94a3b8",
                fontSize: 11, cursor: exporting ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                {exporting ? "⏳ Exporting…" : "⬇ Export PDF"}
              </button>
              <button onClick={handleOcen} disabled={ocenLoading} style={{
                padding: "6px 14px", borderRadius: 8,
                background: ocenLoading ? "var(--c-surface-2)" : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                border: "none", color: "#fff",
                fontSize: 11, fontWeight: 700, cursor: ocenLoading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 5,
              }}>
                {ocenLoading ? "⏳ Submitting…" : "🏦 Submit to OCEN"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Application details — what the applicant actually requested */}
      {isManagerView && _appData && (
        <div style={{
          background: "var(--c-surface)", border: "1px solid var(--c-border)",
          borderRadius: 20, padding: isMobile ? "18px 20px" : "22px 28px", marginBottom: 20,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5 }}>APPLICATION DETAILS</div>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
              color: appStatusColors[appStatus] || "#94a3b8",
              background: `${appStatusColors[appStatus] || "#64748b"}18`,
              border: `1px solid ${appStatusColors[appStatus] || "#64748b"}44`,
              padding: "3px 10px", borderRadius: 20,
            }}>{(appStatus || "").replace("_", " ")}</span>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(5, 1fr)",
            gap: 16,
          }}>
            {[
              { label: "REFERENCE", value: _appData.reference },
              { label: "PRODUCT REQUESTED", value: PRODUCT_LABELS[_appData.product] || _appData.product || "—" },
              { label: "REQUESTED AMOUNT", value: _appData.loan_amount ? `₹${(_appData.loan_amount / 100000).toFixed(1)}L` : "—" },
              { label: "RATE / TENURE", value: _appData.interest_rate ? `${_appData.interest_rate}% • ${_appData.tenure_months}mo` : "—" },
              { label: "SUBMITTED", value: _appData.created_at ? new Date(_appData.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
            ].map(f => (
              <div key={f.label}>
                <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 4 }}>{f.label}</div>
                <div style={{ fontSize: 13, color: "var(--c-text)", fontWeight: 600 }}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NTC/NTB Banner */}
      <NTCBanner ntcFlag={data.ntc_flag} ntbFlag={data.ntb_flag} overallScore={pillar_scores.overall} />

      {/* Score + Pillars Row */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.8fr", gap: 20, marginBottom: 20 }}>

        {/* Left: Gauge + Loan Info */}
        <div style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: 20,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}>
          <ScoreGauge score={pillar_scores.overall} />
          <div style={{ width: "100%", borderTop: "1px solid var(--c-border)", paddingTop: 16 }}>
            <div style={{ fontSize: 11, color: "#475569", marginBottom: 12, letterSpacing: 1.5 }}>LOAN ELIGIBILITY</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--c-text)", marginBottom: 4 }}>
              ₹{(loan_eligibility.eligible_loan_amount / 100000).toFixed(1)}L
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "#64748b" }}>Risk Band</span>
              <span style={{
                fontSize: 11, fontWeight: 700, color: riskColor,
                border: `1px solid ${riskColor}44`,
                padding: "2px 8px", borderRadius: 20,
              }}>{loan_eligibility.risk_band}</span>
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748b", marginBottom: 4 }}>
                <span>ML Confidence</span>
                <span style={{ color: ml_prediction.prediction === "CREDITWORTHY" ? "#22c55e" : "#ef4444" }}>
                  {(ml_prediction.confidence * 100).toFixed(0)}%
                </span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: ml_prediction.prediction === "CREDITWORTHY" ? "#22c55e" : "#ef4444" }}>
                {ml_prediction.prediction}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Pillars */}
        <div style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: 20,
          padding: 28,
        }}>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 20 }}>5-PILLAR BREAKDOWN</div>
          <PillarBar scores={pillar_scores} />
        </div>
      </div>

      {/* Radar + Explanations Row */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.5fr", gap: 20 }}>

        {/* Radar Chart */}
        <div style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: 20,
          padding: 28,
        }}>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 10 }}>PERFORMANCE RADAR</div>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--c-surface-2)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 11 }} />
              <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* SHAP Explanations */}
        <div style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: 20,
          padding: 28,
        }}>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 16 }}>AI EXPLANATION (SHAP)</div>

          {explanations.strengths.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#22c55e", fontWeight: 600, marginBottom: 8 }}>STRENGTHS</div>
              {explanations.strengths.map((s, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px", background: "#15803d11",
                  borderLeft: "3px solid #22c55e", borderRadius: "0 8px 8px 0",
                  marginBottom: 6,
                }}>
                  <span style={{ fontSize: 13 }}>✓</span>
                  <div>
                    <div style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 600 }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>SHAP impact: +{Number(s.shap_value).toFixed(2)} (log-odds)</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {explanations.risks.length > 0 && (
            <div>
              <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, marginBottom: 8 }}>RISK FACTORS</div>
              {explanations.risks.map((r, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px", background: "#dc262611",
                  borderLeft: "3px solid #ef4444", borderRadius: "0 8px 8px 0",
                  marginBottom: 6,
                }}>
                  <span style={{ fontSize: 13 }}>✗</span>
                  <div>
                    <div style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 600 }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: "#64748b" }}>SHAP impact: {Number(r.shap_value).toFixed(2)} (log-odds)</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue Trend Chart — full width */}
      {monthly_revenues && monthly_revenues.length > 0 && (
        <div style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: 20,
          padding: 28,
          marginTop: 20,
        }}>
          <RevenueChart revenues={monthly_revenues} inflows={monthly_inflows} />
        </div>
      )}

      {/* Loan Products Matrix */}
      {loan_eligibility?.products && (
        <div style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: 20,
          padding: 28,
          marginTop: 20,
        }}>
          <LoanProductsMatrix products={loan_eligibility.products} />
        </div>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border)",
          borderRadius: 20,
          padding: 28,
          marginTop: 20,
        }}>
          <Recommendations recommendations={recommendations} />
        </div>
      )}

      {/* Detailed Reports */}
      <div id="hc-reports" />
      {raw_features && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 20, padding: 28, marginTop: 20 }}>
          <DetailedReports data={data} />
        </div>
      )}

      {/* Score Journey Trend */}
      {gstin && (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 20, padding: 28, marginTop: 20 }}>
          <ScoreTrend gstin={gstin} currentScore={pillar_scores.overall} />
        </div>
      )}

      {/* EMI Calculator + What-If Score Simulator — side by side on wide screens */}
      <div id="hc-emi" />
      <div id="hc-simulator" />
      {(loan_eligibility?.products || raw_features) && (
        <div style={{
          display: "grid", gridTemplateColumns: isMobile || !loan_eligibility?.products || !raw_features ? "1fr" : "1fr 1fr",
          gap: 20, marginTop: 20, alignItems: "start",
        }}>
          {loan_eligibility?.products && (
            <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 20, padding: 28 }}>
              <EMICalculator products={loan_eligibility.products} />
            </div>
          )}
          {raw_features && (
            <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 20, padding: 28 }}>
              <ScoreSimulator
                rawFeatures={raw_features}
                currentScores={pillar_scores}
                avgMonthlyRevenue={raw_features.avg_monthly_revenue}
              />
            </div>
          )}
        </div>
      )}

      {/* Peer Benchmarking */}
      <div id="hc-benchmark" />
      <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 20, padding: 28, marginTop: 20 }}>
        <PeerBenchmark businessType={business_type} city={city} myScores={pillar_scores} />
      </div>

      {/* Apply for Loan CTA — only for customer view */}
      {!isManagerView && (
        <div id="hc-apply" style={{ marginTop: 20 }}>
          <LoanApplyCTA data={data} />
        </div>
      )}

      {/* AA Consent Artifact — only for customer view */}
      {!isManagerView && data.consent_id && (
        <div style={{ marginTop: 20 }}>
          <ConsentCard consentId={data.consent_id} />
        </div>
      )}

      {/* Outcome Modal */}
      {showOutcome && (
        <OutcomeModal
          data={data}
          onClose={() => setShowOutcome(false)}
          onSaved={(outcome) => setRecordedOutcome(outcome)}
        />
      )}

      {/* OCEN submission flow */}
      {ocen && <OcenModal ocen={ocen} onClose={() => setOcen(null)} />}
    </div>
  );
}
