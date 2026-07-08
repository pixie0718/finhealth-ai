import React, { useState, useEffect, useRef } from "react";
import RevenueChart from "../components/RevenueChart";
import ScoreSimulator from "../components/ScoreSimulator";
import EMICalculator from "../components/EMICalculator";
import LoanApplyCTA from "../components/LoanApplyCTA";
import PeerBenchmark from "../components/PeerBenchmark";
import ScoreTrend from "../components/ScoreTrend";
import NTCBanner from "../components/NTCBanner";
import ConsentCard from "../components/ConsentCard";

/* ─── responsive hook ─── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

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

/* ─── helpers ─── */
const getColor  = s => s >= 75 ? "#22c55e" : s >= 60 ? "#eab308" : s >= 45 ? "#f97316" : "#ef4444";
const getGrade  = s => s >= 75 ? "A" : s >= 60 ? "B" : s >= 45 ? "C" : "D";
const getLabel  = s => s >= 75 ? "Excellent" : s >= 60 ? "Good" : s >= 45 ? "Fair" : "Needs Work";
const riskColor = { LOW:"#22c55e","MEDIUM-LOW":"#eab308",MEDIUM:"#f97316",HIGH:"#ef4444" };
const fmtL      = v => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${Math.round(v).toLocaleString("en-IN")}`;

// Backend recommendation codes, remapped to bank-facing language.
function recLabel(rec) {
  if (!rec) return rec;
  if (rec.startsWith("APPROVE (NTC")) return "Pre-Qualified (NTC — CGTMSE backed)";
  if (rec === "APPROVE") return "Pre-Qualified";
  if (rec === "RECOMMEND FOR REVIEW") return "Pre-Qualified · Under Review";
  if (rec === "MANUAL UNDERWRITING REQUIRED") return "Manual Review Required";
  if (rec === "DECLINE") return "Not Eligible Yet";
  return rec;
}

/* ─── "Last synced Xm ago", ticking every 30s ─── */
function useTimeAgo(iso) {
  const [, force] = useState(0);
  useEffect(() => {
    const t = setInterval(() => force(n => n + 1), 30000);
    return () => clearInterval(t);
  }, []);
  if (!iso) return "just now";
  const secs = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (secs < 60) return "just now";
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

/* ─── semicircle health meter (Poor / Fair / Good / Excellent) ─── */
function HealthMeter({ score, size = 170, stroke = 14 }) {
  const color = getColor(score);
  const cx = size / 2, cy = size / 2;
  const r = (size - stroke) / 2;
  const halfCirc = Math.PI * r;
  const path = `M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`;
  const offset = halfCirc * (1 - score / 100);

  // Tick marks at the 45 / 60 / 75 band boundaries, in the same angle space as the arc.
  const ticks = [45, 60, 75].map(s => {
    const angleDeg = 180 - (s / 100) * 180;
    const rad = (angleDeg * Math.PI) / 180;
    const x1 = cx + (r - stroke / 2 - 2) * Math.cos(rad), y1 = cy - (r - stroke / 2 - 2) * Math.sin(rad);
    const x2 = cx + (r + stroke / 2 + 2) * Math.cos(rad), y2 = cy - (r + stroke / 2 + 2) * Math.sin(rad);
    return { x1, y1, x2, y2 };
  });

  return (
    <div style={{ position:"relative", width:size, height:size / 2 + 34 }}>
      <svg width={size} height={size / 2 + 4} style={{ display:"block", overflow:"visible" }}>
        <path d={path} fill="none" stroke="var(--c-surface)" strokeWidth={stroke} strokeLinecap="round" />
        <path d={path} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={halfCirc} strokeDashoffset={offset}
          style={{ transition:"stroke-dashoffset 1.2s ease", filter:`drop-shadow(0 0 6px ${color}88)` }} />
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke="var(--c-bg)" strokeWidth={2} />
        ))}
      </svg>
      <div style={{
        position:"absolute", left:0, right:0, bottom:0,
        display:"flex", flexDirection:"column", alignItems:"center",
      }}>
        <div style={{ fontSize:30, fontWeight:900, color, lineHeight:1 }}>{score}</div>
        <div style={{ fontSize:11, fontWeight:700, color, letterSpacing:0.5, marginTop:2 }}>{getLabel(score)}</div>
      </div>
      <div style={{
        position:"absolute", left:2, bottom:0, fontSize:9, color:"#475569",
      }}>Poor</div>
      <div style={{
        position:"absolute", right:2, bottom:0, fontSize:9, color:"#475569",
      }}>Excellent</div>
    </div>
  );
}

/* ─── pillar card ─── */
function PillarCard({ icon, label, score, isMobile }) {
  // NTC mode: credit_worthiness is null — render a graceful N/A placeholder
  if (score === null || score === undefined) {
    return (
      <div style={{
        background:"var(--c-surface)", border:"1px solid #33415566",
        borderRadius:16, padding: isMobile ? "14px 10px" : "20px 16px",
        display:"flex", flexDirection:"column", alignItems:"center", gap:8,
        flex:"1 1 0", minWidth: isMobile ? "calc(50% - 6px)" : 0,
        opacity: 0.55,
      }}>
        <div style={{ position:"relative", width:70, height:70 }}>
          <svg width={70} height={70} style={{ transform:"rotate(-90deg)" }}>
            <circle cx={35} cy={35} r={32} fill="none" stroke="var(--c-bg)" strokeWidth={6} />
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:18 }}>{icon}</div>
        </div>
        <div style={{ fontSize:12, fontWeight:700, color:"#475569" }}>N/A</div>
        <div style={{ fontSize:10, color:"#64748b", textAlign:"center", lineHeight:1.3 }}>
          {label}<br/><span style={{ fontSize:9 }}>(NTC Mode)</span>
        </div>
      </div>
    );
  }
  const color = getColor(score);
  const r = 32, stroke = 6;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{
      background:"var(--c-surface)", border:`1px solid ${color}33`,
      borderRadius:16, padding: isMobile ? "14px 10px" : "20px 16px",
      display:"flex", flexDirection:"column", alignItems:"center", gap:8,
      flex: isMobile ? "1 1 0" : "1 1 200px", maxWidth: isMobile ? undefined : 240,
      minWidth: isMobile ? "calc(50% - 6px)" : 0,
    }}>
      <div style={{ position:"relative", width:70, height:70 }}>
        <svg width={70} height={70} style={{ transform:"rotate(-90deg)" }}>
          <circle cx={35} cy={35} r={r} fill="none" stroke="var(--c-bg)" strokeWidth={stroke} />
          <circle cx={35} cy={35} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition:"stroke-dashoffset 1.2s ease" }} />
        </svg>
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:18 }}>{icon}</div>
      </div>
      <div style={{ fontSize:18, fontWeight:900, color }}>{score}</div>
      <div style={{ fontSize:11, color:"#64748b", textAlign:"center", lineHeight:1.3 }}>{label}</div>
    </div>
  );
}

/* ─── loan product card ─── */
function ProductCard({ icon, label, product, rc, isMobile }) {
  if (!product?.eligible) return null;
  return (
    <div style={{
      background:"var(--c-surface)", border:`1px solid ${rc}22`,
      borderRadius:14, padding:"16px",
      display:"flex", flexDirection:"column", gap:8,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"var(--c-text)" }}>{label}</div>
          <div style={{ fontSize:10, color:"#475569" }}>{product.interest_rate}% p.a. • {product.tenure_months}mo</div>
        </div>
        <div style={{
          marginLeft:"auto", fontSize:10, padding:"2px 8px", borderRadius:20,
          background:"#15803d22", color:"#22c55e", border:"1px solid #22c55e33", fontWeight:700,
        }}>✓</div>
      </div>
      <div style={{ fontSize:22, fontWeight:800, color: rc }}>{fmtL(product.amount)}</div>
    </div>
  );
}

const PRODUCTS = [
  { key:"msme_loan",       icon:"🏭", label:"MSME Loan"         },
  { key:"working_capital", icon:"💧", label:"Working Capital"   },
  { key:"business_loan",   icon:"💼", label:"Business Loan"     },
  { key:"personal_loan",   icon:"👤", label:"Personal Loan"     },
  { key:"auto_loan",       icon:"🚗", label:"Auto Loan"         },
  { key:"home_loan",       icon:"🏠", label:"Home Loan"         },
  { key:"mudra_shishu",    icon:"🌱", label:"MUDRA Shishu"      },
  { key:"mudra_kishore",   icon:"🌿", label:"MUDRA Kishore"     },
  { key:"mudra_tarun",     icon:"🌳", label:"MUDRA Tarun"       },
  { key:"cgtmse_backed",   icon:"🛡️", label:"CGTMSE Backed"    },
  { key:"standup_india",   icon:"⭐", label:"Stand-Up India"    },
];

const SECTIONS = [
  { id:"r-score",     label:"Score",      icon:"📊" },
  { id:"r-products",  label:"Loans",      icon:"🏦" },
  { id:"r-emi",       label:"EMI",        icon:"💰" },
  { id:"r-simulator", label:"Simulator",  icon:"🎯" },
  { id:"r-benchmark", label:"Peers",      icon:"📈" },
  { id:"r-apply",     label:"Apply",      icon:"✅" },
];

export default function MSMEResult({ result, onReset }) {
  const isMobile = useIsMobile();
  const score   = result.pillar_scores.overall;
  const color   = getColor(score);
  const grade   = getGrade(score);
  const label   = getLabel(score);
  const loan    = result.loan_eligibility;
  const lc      = riskColor[loan.risk_band] || "#64748b";
  const ps      = result.pillar_scores;
  const ml      = result.ml_prediction;
  const lastSynced = useTimeAgo(result.generated_at);
  const highPriorityInsights = (result.recommendations || []).filter(r => r.priority === "high");
  const topInsight = highPriorityInsights[0] || result.recommendations?.[0];
  const secondInsight = highPriorityInsights[1];
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Real weighted contribution of each pillar to the overall 0-100 score —
  // same weights used server-side in compute_pillar_scores().
  const PILLAR_WEIGHTS = result.ntc_flag
    ? { cash_flow: 0.30, compliance: 0.24, growth: 0.23, stability: 0.23, credit_worthiness: 0 }
    : { cash_flow: 0.25, compliance: 0.20, growth: 0.20, stability: 0.20, credit_worthiness: 0.15 };

  const printRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const handleExport = async () => {
    setExporting(true);
    try { await exportPDF(printRef.current, result.business_name || "Business"); }
    finally { setExporting(false); }
  };

  return (
    <div ref={printRef} style={{ maxWidth: isMobile ? 720 : 1320, margin:"0 auto", padding: isMobile ? "16px 12px" : "24px 32px" }}>

      {/* ── Sticky quick-nav ── */}
      <div style={{
        position:"sticky", top:60, zIndex:50,
        background:"var(--c-header)", backdropFilter:"blur(8px)",
        borderBottom:"1px solid var(--c-border-soft)",
        display:"flex", gap: isMobile ? 6 : 10,
        justifyContent: isMobile ? "flex-start" : "center",
        padding: isMobile ? "8px 0" : "12px 0", marginBottom:20,
        overflowX: isMobile ? "auto" : "visible", scrollbarWidth:"none",
      }}>
        {SECTIONS.map(s => (
          <button key={s.id} className="fh-nav-pill" onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior:"smooth", block:"start" })} style={{
            padding: isMobile ? "5px 12px" : "8px 20px", borderRadius:20, flexShrink:0,
            background:"var(--c-surface)", border:"1px solid var(--c-border)",
            color:"#94a3b8", fontSize: isMobile ? 11 : 13, cursor:"pointer",
            display:"flex", alignItems:"center", gap: isMobile ? 4 : 6,
            fontWeight: isMobile ? 400 : 600, transition:"all 0.18s ease",
          }}>
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
        <button onClick={handleExport} disabled={exporting} className="fh-nav-pill" style={{
          padding: isMobile ? "5px 12px" : "8px 20px", borderRadius:20, flexShrink:0,
          background:"var(--c-surface)", border:"1px solid var(--c-border)",
          color:"#94a3b8", fontSize: isMobile ? 11 : 13, cursor: exporting ? "not-allowed" : "pointer",
          display:"flex", alignItems:"center", gap: isMobile ? 4 : 6,
          fontWeight: isMobile ? 400 : 600, transition:"all 0.18s ease",
        }}>
          <span>⬇</span>
          <span>{exporting ? "Generating…" : "PDF"}</span>
        </button>
      </div>

      {/* ── Hero card ── */}
      <div id="r-score" style={{
        background:"linear-gradient(135deg, #1e3a5f 0%, var(--c-surface) 50%, #1a0f3d 100%)",
        border:"1px solid var(--c-border)", borderRadius:24,
        padding: isMobile ? "24px 20px" : "32px 36px",
        marginBottom:16, position:"relative", overflow:"hidden",
      }}>
        {/* glow blobs */}
        <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200,
          background:`radial-gradient(circle, ${color}18 0%, transparent 70%)`, borderRadius:"50%", pointerEvents:"none" }} />

        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8, marginBottom:12 }}>
          <div style={{ fontSize:11, color:"#475569", letterSpacing:2 }}>
            YOUR FINANCIAL HEALTH REPORT
          </div>
          <div style={{
            display:"flex", alignItems:"center", gap:6, fontSize:10.5, color:"#64748b",
            padding:"3px 10px", borderRadius:20, background:"var(--c-bg)", border:"1px solid var(--c-border)",
          }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#22c55e", display:"inline-block",
              animation:"pulse 1.8s ease-in-out infinite" }} />
            Last synced {lastSynced}
          </div>
        </div>

        <div style={{ display:"flex", alignItems: isMobile ? "flex-start" : "center",
          justifyContent:"space-between", flexWrap:"wrap", gap:20 }}>

          {/* Left: name + meta */}
          <div style={{ flex:1, minWidth:0 }}>
            <h1 style={{ fontSize: isMobile ? 20 : 26, fontWeight:800, color:"var(--c-text)",
              marginBottom:8, wordBreak:"break-word" }}>
              {result.business_name || "Your Business"}
            </h1>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
              {[result.gstin, `📍 ${result.city}`, `🏭 ${result.business_type}`,
                `⏱ ${result.years_in_business} yrs`].filter(Boolean).map((tag, i) => (
                <span key={i} style={{ fontSize:11, color:"#64748b", background:"var(--c-bg)",
                  padding:"3px 10px", borderRadius:20, border:"1px solid var(--c-border)" }}>{tag}</span>
              ))}
            </div>
            {/* Grade + Band */}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              <div style={{
                padding:"6px 18px", borderRadius:20,
                background:`${color}22`, border:`1px solid ${color}44`,
                fontSize:13, fontWeight:700, color,
              }}>Grade {grade} — {label}</div>
              <div style={{
                padding:"6px 18px", borderRadius:20,
                background:`${lc}18`, border:`1px solid ${lc}33`,
                fontSize:13, fontWeight:700, color:lc,
              }}>{loan.risk_band} RISK</div>
            </div>
          </div>

          {/* Right: health meter */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            <HealthMeter score={score} size={isMobile ? 150 : 170} />
            <div style={{ fontSize:11, color:"#475569", textAlign:"center" }}>
              {ml.prediction === "CREDITWORTHY" ? "✓" : "!"} ML: {ml.prediction}<br/>
              <span style={{ color: ml.prediction === "CREDITWORTHY" ? "#22c55e" : "#ef4444" }}>
                {(ml.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI explainability one-liner ── */}
      {topInsight && (
        <div style={{
          display:"flex", alignItems:"flex-start", gap:12,
          background:"#3b82f60d", border:"1px solid #3b82f633", borderRadius:16,
          padding:"14px 18px", marginBottom:16,
        }}>
          <span style={{ fontSize:18, flexShrink:0 }}>🤖</span>
          <div>
            <span style={{ fontSize:11, fontWeight:700, color:"#93c5fd", letterSpacing:1 }}>AI INSIGHT </span>
            <span style={{ fontSize:13, color:"var(--c-text-2)" }}>
              {topInsight.detail}{secondInsight && secondInsight.detail !== topInsight.detail ? ` ${secondInsight.detail}` : ""}
            </span>
          </div>
        </div>
      )}

      {/* ── NTC / NTB banner ── */}
      <NTCBanner
        ntcFlag={result.ntc_flag}
        ntbFlag={result.ntb_flag}
        hasGstin={result.has_gstin !== false}
        overallScore={score}
      />

      {/* ── Data sources proof panel ── */}
      {result.data_sources && Object.keys(result.data_sources).length > 0 && (
        <div style={{
          background:"var(--c-surface)", border:"1px solid var(--c-border)",
          borderRadius:16, padding:"14px 20px", marginBottom:16,
          display:"flex", gap:12, flexWrap:"wrap", alignItems:"center",
        }}>
          <span style={{ fontSize:11, color:"#475569", letterSpacing:1 }}>DATA FETCHED FROM:</span>
          {result.data_provenance && (
            <div style={{
              display:"flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:20,
              background: result.data_provenance.live ? "#22c55e18" : "#f59e0b12",
              border: `1px solid ${result.data_provenance.live ? "#22c55e55" : "#f59e0b44"}`,
            }} title={result.data_provenance.note}>
              <span style={{ fontSize:11, fontWeight:700, color: result.data_provenance.live ? "#4ade80" : "#fbbf24" }}>
                {result.data_provenance.live ? "🟢 LIVE" : "🟡 SANDBOX"}
              </span>
            </div>
          )}
          {Object.entries(result.data_sources).map(([key, src]) => (
            <div key={key} style={{
              display:"flex", alignItems:"center", gap:6,
              padding:"4px 12px", borderRadius:20,
              background: src.status === "FETCHED" ? "#22c55e11" : "#33415511",
              border: `1px solid ${src.status === "FETCHED" ? "#22c55e33" : "var(--c-surface-2)"}`,
            }}>
              <span style={{ width:6, height:6, borderRadius:"50%",
                background: src.status === "FETCHED" ? "#22c55e" : "#475569",
                display:"inline-block" }} />
              <span style={{ fontSize:11, color: src.status === "FETCHED" ? "#86efac" : "#475569" }}>
                {src.source}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── 5 Pillar scores ── */}
      <div style={{
        background:"var(--c-surface)", border:"1px solid var(--c-border)",
        borderRadius:20, padding: isMobile ? "20px 16px" : "24px 28px",
        marginBottom:16,
      }}>
        <div style={{ fontSize:11, color:"#475569", letterSpacing:1.5, marginBottom:4 }}>
          5-PILLAR BREAKDOWN
        </div>
        <div style={{ fontSize:11, color:"#64748b", marginBottom:20 }}>
          {result.ntc_flag
            ? "Weighted: Cash Flow 30% · Compliance 24% · Growth 23% · Stability 23% (Credit pillar redistributed — NTC mode)"
            : "Weighted: Cash Flow 25% · Compliance 20% · Growth 20% · Stability 20% · Credit 15%"}
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent: isMobile ? "flex-start" : "center" }}>
          {[
            { key:"cash_flow",        icon:"💧", label:"Cash Flow"   },
            { key:"compliance",       icon:"📋", label:"Compliance"  },
            { key:"growth",           icon:"📈", label:"Growth"      },
            { key:"stability",        icon:"🏛️", label:"Stability"   },
            { key:"credit_worthiness",icon:"💳", label:"Credit"      },
          ].map(p => (
            <PillarCard key={p.key} icon={p.icon} label={p.label} score={ps[p.key]} isMobile={isMobile} />
          ))}
        </div>

        <button onClick={() => setShowBreakdown(v => !v)} style={{
          display:"flex", alignItems:"center", gap:6, margin:"20px auto 0",
          background:"transparent", border:"none", color:"#3b82f6",
          fontSize:12, fontWeight:600, cursor:"pointer",
        }}>
          Why did I get {Math.round(score)}? <span style={{ transform: showBreakdown ? "rotate(180deg)" : "none", display:"inline-block", transition:"transform 0.2s" }}>▾</span>
        </button>

        {showBreakdown && (
          <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:8 }}>
            {[
              { key:"cash_flow",         label:"Cash Flow"   },
              { key:"compliance",        label:"Compliance"  },
              { key:"growth",            label:"Growth"      },
              { key:"stability",         label:"Stability"   },
              { key:"credit_worthiness", label:"Credit"      },
            ].filter(p => ps[p.key] != null).map(p => {
              const weight = PILLAR_WEIGHTS[p.key] || 0;
              const contribution = ps[p.key] * weight;
              return (
                <div key={p.key} style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  background:"var(--c-bg)", border:"1px solid var(--c-border-soft)",
                  borderRadius:10, padding:"8px 14px", fontSize:12,
                }}>
                  <span style={{ color:"#94a3b8" }}>{p.label} <span style={{ color:"#475569" }}>({ps[p.key]} × {Math.round(weight * 100)}%)</span></span>
                  <span style={{ fontWeight:700, color: contribution >= 15 ? "#22c55e" : contribution >= 8 ? "#eab308" : "#f97316" }}>
                    +{contribution.toFixed(1)} pts
                  </span>
                </div>
              );
            })}
            <div style={{ fontSize:10.5, color:"#64748b", marginTop:4, textAlign:"center" }}>
              Sum of weighted pillar contributions = your overall score of {Math.round(score)}.
            </div>
          </div>
        )}
      </div>

      {/* ── Strengths & Risks ── */}
      <div style={{
        display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap:16, marginBottom:16,
      }}>
        <div style={{ background:"#0d2618", border:"1px solid #15803d33", borderRadius:20, padding:"20px 24px" }}>
          <div style={{ fontSize:11, color:"#22c55e", fontWeight:700, letterSpacing:1.5, marginBottom:14 }}>
            YOUR STRENGTHS
          </div>
          {(result.explanations?.strengths || []).length === 0 && (
            <div style={{ fontSize:12, color:"#4ade8088", lineHeight:1.6 }}>
              No standout strengths yet. Check the recommendations below to build them — improving GST compliance and cash flow lifts your score fastest.
            </div>
          )}
          {(result.explanations?.strengths || []).map((s, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"flex-start", gap:10,
              padding:"10px 12px", background:"#15803d11",
              borderLeft:"3px solid #22c55e", borderRadius:"0 10px 10px 0",
              marginBottom:8,
            }}>
              <span style={{ color:"#22c55e", fontWeight:700, flexShrink:0 }}>✓</span>
              <div>
                <div style={{ fontSize:13, color:"#86efac", fontWeight:600 }}>{s.label}</div>
                <div style={{ fontSize:11, color:"#4ade8088", marginTop:2 }}>
                  Positive contributor to your creditworthiness
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background:"#1c0f0f", border:"1px solid #dc262633", borderRadius:20, padding:"20px 24px" }}>
          <div style={{ fontSize:11, color:"#ef4444", fontWeight:700, letterSpacing:1.5, marginBottom:14 }}>
            IMPROVE THESE
          </div>
          {(result.explanations?.risks || []).length === 0 && (
            <div style={{ fontSize:12, color:"#f8717188", lineHeight:1.6 }}>
              No major risk factors flagged — your profile is well-balanced. Keep filings and payments on time to maintain it.
            </div>
          )}
          {(result.explanations?.risks || []).map((r, i) => (
            <div key={i} style={{
              display:"flex", alignItems:"flex-start", gap:10,
              padding:"10px 12px", background:"#dc262611",
              borderLeft:"3px solid #ef4444", borderRadius:"0 10px 10px 0",
              marginBottom:8,
            }}>
              <span style={{ color:"#ef4444", fontWeight:700, flexShrink:0 }}>!</span>
              <div>
                <div style={{ fontSize:13, color:"#fca5a5", fontWeight:600 }}>{r.label}</div>
                <div style={{ fontSize:11, color:"#f8717188", marginTop:2 }}>
                  Weighing down your score — focus here to improve
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Revenue chart ── */}
      {result.monthly_revenues?.length > 0 && (
        <div style={{ background:"var(--c-surface)", border:"1px solid var(--c-border)", borderRadius:20, padding:"24px", marginBottom:16 }}>
          <RevenueChart revenues={result.monthly_revenues} inflows={result.monthly_inflows} />
        </div>
      )}

      {/* ── Recommendations ── */}
      {result.recommendations?.length > 0 && (
        <div style={{ background:"var(--c-surface)", border:"1px solid var(--c-border)", borderRadius:20, padding:"24px", marginBottom:16 }}>
          <div style={{ fontSize:11, color:"#475569", letterSpacing:1.5, marginBottom:16 }}>ACTION RECOMMENDATIONS</div>
          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:10 }}>
            {result.recommendations.map((rec, i) => (
              <div key={i} style={{
                background:"var(--c-bg)", border:`1px solid ${rec.priority === "high" ? "#ef444433" : "var(--c-surface-2)"}`,
                borderRadius:14, padding:"14px 16px",
              }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:18 }}>{rec.icon}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:"var(--c-text)" }}>{rec.title}</span>
                  </div>
                  <span style={{
                    fontSize:9, padding:"2px 8px", borderRadius:10, fontWeight:700, letterSpacing:0.5,
                    background: rec.priority === "high" ? "#ef444422" : rec.priority === "medium" ? "#f9731622" : "#3b82f622",
                    color: rec.priority === "high" ? "#ef4444" : rec.priority === "medium" ? "#f97316" : "#3b82f6",
                    border: `1px solid ${rec.priority === "high" ? "#ef444433" : rec.priority === "medium" ? "#f9731633" : "#3b82f633"}`,
                  }}>{rec.priority.toUpperCase()}</span>
                </div>
                <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.6 }}>{rec.detail}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── AA Consent Artifact ── */}
      {result.consent_id && (
        <div style={{ marginBottom:16 }}>
          <ConsentCard consentId={result.consent_id} />
        </div>
      )}

      {/* ── Score Journey ── */}
      {result.gstin && (
        <div style={{ background:"var(--c-surface)", border:"1px solid var(--c-border)", borderRadius:20, padding:"24px", marginBottom:16 }}>
          <ScoreTrend gstin={result.gstin} currentScore={score} />
        </div>
      )}

      {/* ── Peer benchmark ── */}
      <div id="r-benchmark" style={{ background:"var(--c-surface)", border:"1px solid var(--c-border)", borderRadius:20,
        padding:"24px", marginBottom:16 }}>
        <PeerBenchmark businessType={result.business_type} city={result.city} myScores={ps} />
      </div>

      {/* ── EMI Calculator + Score Simulator ── */}
      <div style={{
        display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap:16, marginBottom:16, alignItems:"start",
      }}>
        <div id="r-emi" style={{ background:"var(--c-surface)", border:"1px solid var(--c-border)", borderRadius:20,
          padding:"24px" }}>
          <EMICalculator products={loan.products} />
        </div>

        <div id="r-simulator" style={{ background:"var(--c-surface)", border:"1px solid var(--c-border)", borderRadius:20,
          padding:"24px" }}>
          <ScoreSimulator rawFeatures={result.raw_features} currentScores={ps}
            avgMonthlyRevenue={result.raw_features?.avg_monthly_revenue}
            hasGstin={result.has_gstin !== false} />
        </div>
      </div>

      {/* ── Loan eligibility banner ── */}
      <div id="r-products" style={{
        background:`linear-gradient(135deg, ${lc}12, ${lc}06)`,
        border:`1px solid ${lc}33`, borderRadius:20,
        padding: isMobile ? "20px" : "24px 32px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexWrap:"wrap", gap:16, marginBottom:16,
      }}>
        <div>
          <div style={{ fontSize:11, color:lc, fontWeight:700, letterSpacing:1.5, marginBottom:6 }}>
            BASED ON YOUR HEALTH SCORE — LOAN ELIGIBILITY
          </div>
          <div style={{ fontSize: isMobile ? 32 : 42, fontWeight:900, color:"var(--c-text)", lineHeight:1 }}>
            {fmtL(loan.eligible_loan_amount)}
          </div>
          <div style={{ fontSize:13, color:"#64748b", marginTop:4 }}>
            Maximum eligible • {recLabel(loan.recommendation)}
          </div>
        </div>
        <div style={{ textAlign:"center", minWidth:150 }}>
          <div style={{
            padding:"10px 24px", borderRadius:12,
            background:`${lc}22`, border:`1px solid ${lc}44`,
            fontSize:16, fontWeight:800, color:lc,
          }}>
            {recLabel(loan.recommendation)}
          </div>
          <div style={{ fontSize:10.5, color:"#64748b", marginTop:6 }}>
            AI Recommendation · {(ml.confidence * 100).toFixed(0)}% confidence
          </div>
        </div>
      </div>

      {/* ── Loan products ── */}
      <div style={{ background:"var(--c-surface)", border:"1px solid var(--c-border)", borderRadius:20,
        padding:"24px", marginBottom:16 }}>
        <div style={{ fontSize:11, color:"#475569", letterSpacing:1.5, marginBottom:16 }}>
          ELIGIBLE LOAN PRODUCTS
        </div>
        <div style={{
          display:"grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(auto-fit, minmax(200px, 1fr))",
          gap:14,
        }}>
          {PRODUCTS.map(p => (
            <ProductCard key={p.key} {...p} product={loan.products?.[p.key]} rc={lc} isMobile={isMobile} />
          ))}
        </div>
      </div>

      {/* ── Apply CTA ── */}
      <div id="r-apply" style={{ marginBottom:16 }}>
        <LoanApplyCTA data={result} />
      </div>

      <button onClick={onReset} style={{
        width:"100%", padding:14,
        background:"transparent", border:"1px solid var(--c-border)",
        borderRadius:14, color:"#64748b", fontSize:14, cursor:"pointer",
      }}>
        ← Check Another Business
      </button>

      {/* ── Powered-by footer ── */}
      <div style={{
        display:"flex", flexDirection:"column", alignItems:"center", gap:8,
        marginTop:24, paddingTop:20, borderTop:"1px solid var(--c-border-soft)",
      }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", flexWrap:"wrap", gap:10 }}>
          <span style={{ fontSize:10.5, color:"#475569", letterSpacing:0.5 }}>BUILT FOR</span>
          {["AA", "OCEN", "ULI", "GSTN", "NPCI"].map(name => (
            <span key={name} style={{
              fontSize:10.5, fontWeight:700, color:"#64748b",
              padding:"3px 10px", borderRadius:20,
              background:"var(--c-surface)", border:"1px solid var(--c-border)",
            }}>{name}</span>
          ))}
        </div>
        <div style={{ fontSize:10, color:"#475569", textAlign:"center" }}>
          Built for integration with the GSTN, NPCI &amp; Account Aggregator ecosystem — data shown above is sandbox/synthetic for this demo.
        </div>
      </div>
    </div>
  );
}
