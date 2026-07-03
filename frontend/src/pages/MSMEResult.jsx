import React, { useState, useEffect } from "react";
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

/* ─── helpers ─── */
const getColor  = s => s >= 75 ? "#22c55e" : s >= 60 ? "#eab308" : s >= 45 ? "#f97316" : "#ef4444";
const getGrade  = s => s >= 75 ? "A" : s >= 60 ? "B" : s >= 45 ? "C" : "D";
const getLabel  = s => s >= 75 ? "Excellent" : s >= 60 ? "Good" : s >= 45 ? "Fair" : "Needs Work";
const riskColor = { LOW:"#22c55e","MEDIUM-LOW":"#eab308",MEDIUM:"#f97316",HIGH:"#ef4444" };
const fmtL      = v => v >= 100000 ? `₹${(v/100000).toFixed(1)}L` : `₹${Math.round(v).toLocaleString("en-IN")}`;

/* ─── circular score ring ─── */
function ScoreRing({ score, size = 130, stroke = 10 }) {
  const color = getColor(score);
  const r     = (size - stroke) / 2;
  const circ  = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div style={{ position:"relative", width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)", display:"block" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition:"stroke-dashoffset 1.2s ease", filter:`drop-shadow(0 0 6px ${color}88)` }} />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize: size > 100 ? 32 : 20, fontWeight:900, color, lineHeight:1 }}>{score}</div>
        <div style={{ fontSize:10, color:"#475569" }}>/ 100</div>
      </div>
    </div>
  );
}

/* ─── pillar card ─── */
function PillarCard({ icon, label, score, isMobile }) {
  // NTC mode: credit_worthiness is null — render a graceful N/A placeholder
  if (score === null || score === undefined) {
    return (
      <div style={{
        background:"#1e293b", border:"1px solid #33415566",
        borderRadius:16, padding: isMobile ? "14px 10px" : "20px 16px",
        display:"flex", flexDirection:"column", alignItems:"center", gap:8,
        flex:"1 1 0", minWidth: isMobile ? "calc(50% - 6px)" : 0,
        opacity: 0.55,
      }}>
        <div style={{ position:"relative", width:70, height:70 }}>
          <svg width={70} height={70} style={{ transform:"rotate(-90deg)" }}>
            <circle cx={35} cy={35} r={32} fill="none" stroke="#0f172a" strokeWidth={6} />
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:18 }}>{icon}</div>
        </div>
        <div style={{ fontSize:12, fontWeight:700, color:"#475569" }}>N/A</div>
        <div style={{ fontSize:10, color:"#334155", textAlign:"center", lineHeight:1.3 }}>
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
      background:"#1e293b", border:`1px solid ${color}33`,
      borderRadius:16, padding: isMobile ? "14px 10px" : "20px 16px",
      display:"flex", flexDirection:"column", alignItems:"center", gap:8,
      flex:"1 1 0", minWidth: isMobile ? "calc(50% - 6px)" : 0,
    }}>
      <div style={{ position:"relative", width:70, height:70 }}>
        <svg width={70} height={70} style={{ transform:"rotate(-90deg)" }}>
          <circle cx={35} cy={35} r={r} fill="none" stroke="#0f172a" strokeWidth={stroke} />
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
      background:"#1e293b", border:`1px solid ${rc}22`,
      borderRadius:14, padding:"16px",
      display:"flex", flexDirection:"column", gap:8,
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <div>
          <div style={{ fontSize:13, fontWeight:700, color:"#f1f5f9" }}>{label}</div>
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

  return (
    <div style={{ maxWidth: 720, margin:"0 auto", padding: isMobile ? "16px 12px" : "24px 16px" }}>

      {/* ── Sticky quick-nav ── */}
      <div style={{
        position:"sticky", top:60, zIndex:50,
        background:"#0f172aee", backdropFilter:"blur(8px)",
        borderBottom:"1px solid #1e293b",
        display:"flex", gap:6, padding:"8px 0", marginBottom:20,
        overflowX:"auto", scrollbarWidth:"none",
      }}>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior:"smooth", block:"start" })} style={{
            padding:"5px 12px", borderRadius:20, flexShrink:0,
            background:"#1e293b", border:"1px solid #334155",
            color:"#94a3b8", fontSize:11, cursor:"pointer",
            display:"flex", alignItems:"center", gap:4,
          }}>
            <span>{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      {/* ── Hero card ── */}
      <div id="r-score" style={{
        background:"linear-gradient(135deg, #1e3a5f 0%, #1e293b 50%, #1a0f3d 100%)",
        border:"1px solid #334155", borderRadius:24,
        padding: isMobile ? "24px 20px" : "32px 36px",
        marginBottom:16, position:"relative", overflow:"hidden",
      }}>
        {/* glow blobs */}
        <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200,
          background:`radial-gradient(circle, ${color}18 0%, transparent 70%)`, borderRadius:"50%", pointerEvents:"none" }} />

        <div style={{ fontSize:11, color:"#475569", letterSpacing:2, marginBottom:12 }}>
          YOUR FINANCIAL HEALTH REPORT
        </div>

        <div style={{ display:"flex", alignItems: isMobile ? "flex-start" : "center",
          justifyContent:"space-between", flexWrap:"wrap", gap:20 }}>

          {/* Left: name + meta */}
          <div style={{ flex:1, minWidth:0 }}>
            <h1 style={{ fontSize: isMobile ? 20 : 26, fontWeight:800, color:"#f1f5f9",
              marginBottom:8, wordBreak:"break-word" }}>
              {result.business_name || "Your Business"}
            </h1>
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
              {[result.gstin, `📍 ${result.city}`, `🏭 ${result.business_type}`,
                `⏱ ${result.years_in_business} yrs`].filter(Boolean).map((tag, i) => (
                <span key={i} style={{ fontSize:11, color:"#64748b", background:"#0f172a",
                  padding:"3px 10px", borderRadius:20, border:"1px solid #334155" }}>{tag}</span>
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

          {/* Right: score ring */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            <ScoreRing score={score} size={isMobile ? 110 : 130} />
            <div style={{ fontSize:11, color:"#475569", textAlign:"center" }}>
              {ml.prediction === "CREDITWORTHY" ? "✓" : "!"} ML: {ml.prediction}<br/>
              <span style={{ color: ml.prediction === "CREDITWORTHY" ? "#22c55e" : "#ef4444" }}>
                {(ml.confidence * 100).toFixed(0)}% confidence
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── NTC / NTB banner ── */}
      <NTCBanner
        ntcFlag={result.ntc_flag}
        ntbFlag={result.ntb_flag}
        overallScore={score}
      />

      {/* ── Data sources proof panel ── */}
      {result.data_sources && Object.keys(result.data_sources).length > 0 && (
        <div style={{
          background:"#1e293b", border:"1px solid #334155",
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
              border: `1px solid ${src.status === "FETCHED" ? "#22c55e33" : "#334155"}`,
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

      {/* ── Loan eligibility banner ── */}
      <div style={{
        background:`linear-gradient(135deg, ${lc}12, ${lc}06)`,
        border:`1px solid ${lc}33`, borderRadius:20,
        padding: isMobile ? "20px" : "24px 32px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        flexWrap:"wrap", gap:16, marginBottom:16,
      }}>
        <div>
          <div style={{ fontSize:11, color:lc, fontWeight:700, letterSpacing:1.5, marginBottom:6 }}>
            LOAN ELIGIBILITY
          </div>
          <div style={{ fontSize: isMobile ? 32 : 42, fontWeight:900, color:"#f1f5f9", lineHeight:1 }}>
            {fmtL(loan.eligible_loan_amount)}
          </div>
          <div style={{ fontSize:13, color:"#64748b", marginTop:4 }}>
            Maximum eligible • {loan.recommendation}
          </div>
        </div>
        <div style={{
          padding:"10px 24px", borderRadius:12,
          background:`${lc}22`, border:`1px solid ${lc}44`,
          fontSize:16, fontWeight:800, color:lc,
          textAlign:"center", minWidth:120,
        }}>
          {loan.recommendation}
        </div>
      </div>

      {/* ── 5 Pillar scores ── */}
      <div style={{
        background:"#1e293b", border:"1px solid #334155",
        borderRadius:20, padding: isMobile ? "20px 16px" : "24px 28px",
        marginBottom:16,
      }}>
        <div style={{ fontSize:11, color:"#475569", letterSpacing:1.5, marginBottom:20 }}>
          5-PILLAR BREAKDOWN
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
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
      </div>

      {/* ── Strengths & Risks ── */}
      <div style={{
        display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap:12, marginBottom:16,
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
        <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:20, padding:"24px", marginBottom:16 }}>
          <RevenueChart revenues={result.monthly_revenues} inflows={result.monthly_inflows} />
        </div>
      )}

      {/* ── Loan products ── */}
      <div id="r-products" style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:20,
        padding:"24px", marginBottom:16 }}>
        <div style={{ fontSize:11, color:"#475569", letterSpacing:1.5, marginBottom:16 }}>
          ELIGIBLE LOAN PRODUCTS
        </div>
        <div style={{
          display:"grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)",
          gap:10,
        }}>
          {PRODUCTS.map(p => (
            <ProductCard key={p.key} {...p} product={loan.products?.[p.key]} rc={lc} isMobile={isMobile} />
          ))}
        </div>
      </div>

      {/* ── Recommendations ── */}
      {result.recommendations?.length > 0 && (
        <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:20, padding:"24px", marginBottom:16 }}>
          <div style={{ fontSize:11, color:"#475569", letterSpacing:1.5, marginBottom:16 }}>ACTION RECOMMENDATIONS</div>
          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:10 }}>
            {result.recommendations.map((rec, i) => (
              <div key={i} style={{
                background:"#0f172a", border:`1px solid ${rec.priority === "high" ? "#ef444433" : "#334155"}`,
                borderRadius:14, padding:"14px 16px",
              }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:18 }}>{rec.icon}</span>
                    <span style={{ fontSize:13, fontWeight:700, color:"#f1f5f9" }}>{rec.title}</span>
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
        <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:20, padding:"24px", marginBottom:16 }}>
          <ScoreTrend gstin={result.gstin} currentScore={score} />
        </div>
      )}

      {/* ── Peer benchmark ── */}
      <div id="r-benchmark" style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:20,
        padding:"24px", marginBottom:16 }}>
        <PeerBenchmark businessType={result.business_type} city={result.city} myScores={ps} />
      </div>

      {/* ── EMI Calculator ── */}
      <div id="r-emi" style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:20,
        padding:"24px", marginBottom:16 }}>
        <EMICalculator products={loan.products} />
      </div>

      {/* ── Score Simulator ── */}
      <div id="r-simulator" style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:20,
        padding:"24px", marginBottom:16 }}>
        <ScoreSimulator rawFeatures={result.raw_features} currentScores={ps}
          avgMonthlyRevenue={result.raw_features?.avg_monthly_revenue} />
      </div>

      {/* ── Apply CTA ── */}
      <div id="r-apply" style={{ marginBottom:16 }}>
        <LoanApplyCTA data={result} />
      </div>

      <button onClick={onReset} style={{
        width:"100%", padding:14,
        background:"transparent", border:"1px solid #334155",
        borderRadius:14, color:"#64748b", fontSize:14, cursor:"pointer",
      }}>
        ← Check Another Business
      </button>
    </div>
  );
}
