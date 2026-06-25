import React, { useState, useEffect } from "react";
import EMICalculator from "../components/EMICalculator";
import ScoreSimulator from "../components/ScoreSimulator";
import PeerBenchmark from "../components/PeerBenchmark";
import ComplianceCalendar from "../components/ComplianceCalendar";

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

/* ─── default products for EMI standalone ─── */
const DEFAULT_PRODUCTS = {
  msme_loan:       { eligible:true, amount:2500000, interest_rate:10.50, tenure_months:60  },
  working_capital: { eligible:true, amount:1000000, interest_rate:12.00, tenure_months:12  },
  business_loan:   { eligible:true, amount:1500000, interest_rate:13.50, tenure_months:48  },
  personal_loan:   { eligible:true, amount:500000,  interest_rate:14.00, tenure_months:36  },
  auto_loan:       { eligible:true, amount:800000,  interest_rate:9.50,  tenure_months:60  },
  home_loan:       { eligible:true, amount:5000000, interest_rate:8.75,  tenure_months:240 },
};

/* ─── default features for Score Simulator standalone ─── */
const DEFAULT_FEATURES = {
  gst_compliance:      0.75,
  epfo_compliance:     0.78,
  credit_score_norm:   0.67,   // ~700 CIBIL
  bounce_rate:         0.06,
  revenue_growth:      0.12,
  cash_flow_ratio:     0.62,
  inflow_stability:    0.68,
  avg_balance_ratio:   0.38,
  tax_to_revenue:      0.12,
  revenue_cv:          0.25,
  buyer_diversity:     10,
  salary_stability:    0.72,
  years_in_business:   5,
  has_credit_history:  true,
  dpd_30:              0,
  dpd_90:              0,
  revenue_trend_norm:  0.08,
  emp_growth:          0.08,
  avg_monthly_revenue: 500000,
};

function clip(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }
function computeScores(f) {
  const cf   = clip((f.cash_flow_ratio*0.35 + f.inflow_stability*0.25 + (1-f.bounce_rate)*0.25 + Math.min(f.avg_balance_ratio,1)*0.15)*100, 0, 100);
  const comp = clip((f.gst_compliance*0.50 + f.epfo_compliance*0.35 + Math.min(f.tax_to_revenue/0.18,1)*0.15)*100, 0, 100);
  const growth = clip(((f.revenue_growth+1)/4*0.45 + ((f.emp_growth||0)+1)/4*0.30 + ((f.revenue_trend_norm||0)+0.5)*0.25)*100, 0, 100);
  const stability = clip(((1-f.revenue_cv)*0.35 + Math.min(f.buyer_diversity/20,1)*0.25 + f.salary_stability*0.20 + Math.min(f.years_in_business/10,1)*0.20)*100, 0, 100);
  const credit = f.has_credit_history ? clip(f.credit_score_norm*80 - (f.dpd_30*5 + f.dpd_90*15) + 20, 0, 100) : 40;
  const overall = cf*0.25 + comp*0.20 + growth*0.20 + stability*0.20 + credit*0.15;
  return {
    cash_flow: Math.round(cf*10)/10,
    compliance: Math.round(comp*10)/10,
    growth: Math.round(growth*10)/10,
    stability: Math.round(stability*10)/10,
    credit_worthiness: Math.round(credit*10)/10,
    overall: Math.round(overall*10)/10,
  };
}

const DEFAULT_SCORES = computeScores(DEFAULT_FEATURES);

const BUSINESS_TYPES = ["Textile","Pharma","Electronics","Food Processing","Retail","Construction","IT Services","Logistics"];
const CITIES = ["Mumbai","Delhi","Surat","Ahmedabad","Pune","Bangalore","Chennai","Hyderabad","Kolkata","Jaipur"];

const TOOLS = [
  { id:"emi",        icon:"💰", label:"EMI Calculator",   desc:"Calculate monthly EMI for any loan"     },
  { id:"simulator",  icon:"🎯", label:"Score Simulator",  desc:"Simulate your financial health score"   },
  { id:"benchmark",  icon:"📈", label:"Peer Benchmark",   desc:"Compare with industry peers"            },
  { id:"compliance", icon:"📅", label:"Compliance",       desc:"Track GST, EPFO, TDS deadlines"         },
];

export default function ToolsHub() {
  const isMobile = useIsMobile();
  const [active, setActive] = useState("emi");
  const [btType, setBtType] = useState("Textile");
  const [btCity, setBtCity] = useState("Mumbai");

  const inp = {
    background:"#0f172a", border:"1px solid #334155", borderRadius:10,
    padding:"10px 14px", color:"#f1f5f9", fontSize:13, outline:"none",
  };

  return (
    <div style={{ maxWidth:860, margin:"0 auto", padding: isMobile ? "16px 12px" : "28px 20px" }}>

      {/* Page header */}
      <div style={{ marginBottom:28 }}>
        <div style={{ fontSize:11, color:"#3b82f6", letterSpacing:2, fontWeight:700, marginBottom:6 }}>
          FINANCIAL TOOLS
        </div>
        <h2 style={{ fontSize: isMobile ? 20 : 26, fontWeight:800, color:"#f1f5f9", marginBottom:6 }}>
          Tools & Calculators
        </h2>
        <p style={{ fontSize:13, color:"#64748b" }}>
          Free tools to help you plan your loan, improve your score, and stay compliant.
        </p>
      </div>

      {/* Tool selector */}
      <div style={{
        display:"grid",
        gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
        gap:10, marginBottom:24,
      }}>
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)} style={{
            padding:"14px 12px",
            background: active === t.id ? "#1e3a5f" : "#1e293b",
            border: active === t.id ? "1.5px solid #3b82f6" : "1px solid #334155",
            borderRadius:16, cursor:"pointer", textAlign:"left",
            transition:"all 0.15s",
          }}>
            <div style={{ fontSize:22, marginBottom:6 }}>{t.icon}</div>
            <div style={{ fontSize:13, fontWeight:700,
              color: active === t.id ? "#93c5fd" : "#f1f5f9", lineHeight:1.2, marginBottom:4 }}>
              {t.label}
            </div>
            <div style={{ fontSize:11, color:"#475569", lineHeight:1.3 }}>{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Tool panel */}
      <div style={{
        background:"#1e293b", border:"1px solid #334155",
        borderRadius:24, padding: isMobile ? "20px 16px" : "32px 28px",
        minHeight:400,
      }}>

        {/* ── EMI Calculator ── */}
        {active === "emi" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, color:"#475569", letterSpacing:1.5 }}>TOOL</div>
              <h3 style={{ fontSize:18, fontWeight:700, color:"#f1f5f9", marginTop:4 }}>EMI Calculator</h3>
              <p style={{ fontSize:13, color:"#64748b", marginTop:4 }}>
                Select a loan type, adjust the amount and tenure, and instantly see your monthly EMI.
              </p>
            </div>
            <EMICalculator products={DEFAULT_PRODUCTS} />
          </div>
        )}

        {/* ── Score Simulator ── */}
        {active === "simulator" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, color:"#475569", letterSpacing:1.5 }}>TOOL</div>
              <h3 style={{ fontSize:18, fontWeight:700, color:"#f1f5f9", marginTop:4 }}>Score Simulator</h3>
              <p style={{ fontSize:13, color:"#64748b", marginTop:4 }}>
                Explore how improving key metrics — GST compliance, credit score, payment discipline — lifts your financial health score.
                Values start at typical MSME averages.
              </p>
            </div>
            <div style={{
              display:"flex", alignItems:"center", gap:10, marginBottom:20,
              padding:"12px 16px",
              background:"#0f172a", border:"1px solid #334155", borderRadius:12,
            }}>
              <span style={{ fontSize:16 }}>ℹ️</span>
              <span style={{ fontSize:12, color:"#64748b" }}>
                Check your eligibility first to simulate with your actual data.
                These defaults reflect a typical MSME.
              </span>
            </div>
            <ScoreSimulator
              rawFeatures={DEFAULT_FEATURES}
              currentScores={DEFAULT_SCORES}
              avgMonthlyRevenue={DEFAULT_FEATURES.avg_monthly_revenue}
            />
          </div>
        )}

        {/* ── Peer Benchmark ── */}
        {active === "benchmark" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, color:"#475569", letterSpacing:1.5 }}>TOOL</div>
              <h3 style={{ fontSize:18, fontWeight:700, color:"#f1f5f9", marginTop:4 }}>Peer Benchmark</h3>
              <p style={{ fontSize:13, color:"#64748b", marginTop:4 }}>
                See how businesses like yours perform on average. Select your industry and city below.
              </p>
            </div>

            {/* Inputs */}
            <div style={{
              display:"grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap:12, marginBottom:24,
            }}>
              <div>
                <div style={{ fontSize:11, color:"#64748b", marginBottom:6, fontWeight:600, letterSpacing:0.8 }}>
                  BUSINESS TYPE
                </div>
                <select value={btType} onChange={e => setBtType(e.target.value)} style={{ ...inp, width:"100%" }}>
                  {BUSINESS_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:11, color:"#64748b", marginBottom:6, fontWeight:600, letterSpacing:0.8 }}>
                  CITY
                </div>
                <select value={btCity} onChange={e => setBtCity(e.target.value)} style={{ ...inp, width:"100%" }}>
                  {CITIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <PeerBenchmark businessType={btType} city={btCity} myScores={null} />
          </div>
        )}

        {/* ── Compliance Calendar ── */}
        {active === "compliance" && (
          <div>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, color:"#475569", letterSpacing:1.5 }}>TOOL</div>
              <h3 style={{ fontSize:18, fontWeight:700, color:"#f1f5f9", marginTop:4 }}>Compliance Calendar</h3>
              <p style={{ fontSize:13, color:"#64748b", marginTop:4 }}>
                Never miss a GST, EPFO, TDS, or Income Tax deadline. Upcoming dues highlighted by urgency.
              </p>
            </div>
            <ComplianceCalendar />
          </div>
        )}
      </div>
    </div>
  );
}
