import React, { useState, useEffect } from "react";
import { generateScore, getHistory } from "../api/client";
import { useAuth } from "../context/AuthContext";
import LoadingSteps from "../components/LoadingSteps";
import MSMEResult from "./MSMEResult";

const STORAGE_KEY = "fh_owner_last_result";

// Restore the last result/form for the current user (survives tab switches & refresh).
function readSaved(email) {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (s && s.email && s.email === email) return s;
  } catch (e) { /* ignore */ }
  return null;
}

/* ─── responsive hook ─── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

const INDUSTRIES = ["Textile","Pharma","Electronics","Food Processing","Retail","Construction","IT Services","Logistics"];
const CONSTITUTIONS = ["Sole Proprietorship","Partnership","LLP","Private Limited","OPC"];
const CITIES = ["Mumbai","Delhi","Surat","Ahmedabad","Pune","Bangalore","Chennai","Hyderabad","Kolkata","Jaipur"];
const STATES = ["Maharashtra","Delhi","Gujarat","Karnataka","Tamil Nadu","Telangana","West Bengal","Rajasthan","Uttar Pradesh","Punjab"];
const BANKS = ["HDFC Bank","ICICI Bank","State Bank of India","Axis Bank","Kotak Mahindra Bank","Bank of Baroda","Punjab National Bank","Other"];

const inp = {
  width: "100%", background: "var(--c-bg)", border: "1px solid var(--c-border)",
  borderRadius: 10, padding: "12px 16px", color: "var(--c-text)",
  fontSize: 14, outline: "none", boxSizing: "border-box",
};
const lbl = { fontSize: 11, color: "#64748b", marginBottom: 6, display: "block", letterSpacing: 0.8, fontWeight: 600 };

const TRUST_ITEMS = [
  { icon:"📊", label:"GST Revenue Data",     sub:"From GSTN portal"           },
  { icon:"🏦", label:"Bank Statements",       sub:"Via AA Framework"           },
  { icon:"📱", label:"UPI Transaction Flow",  sub:"From NPCI"                  },
  { icon:"👥", label:"Employee Records",      sub:"From EPFO"                  },
  { icon:"💳", label:"Credit History",        sub:"From CIBIL / Equifax"       },
];

// Feature-framed view of the same underlying data sources, shown pre-consent
// so the pitch reads as "AI signals" rather than a raw data-fetch list.
const AI_SIGNALS = [
  { icon:"📈", label:"Revenue Stability",  sub:"Trend & consistency from GST + bank inflow" },
  { icon:"💧", label:"Cash Flow",          sub:"UPI + bank balance & bounce-rate pattern"    },
  { icon:"📋", label:"GST Compliance",     sub:"Filing consistency via GSTN"                 },
  { icon:"📱", label:"Digital Payments",   sub:"UPI transaction volume & frequency"          },
  { icon:"👥", label:"Employment Stability", sub:"Payroll consistency via EPFO"              },
  { icon:"💳", label:"Credit Behaviour",   sub:"Repayment history via CIBIL / Equifax"       },
];

const BENEFITS = [
  { icon:"⚡", text:"Real-time assessment after consent" },
  { icon:"📄", text:"No documents required"      },
  { icon:"🔒", text:"Bank-grade encryption"      },
  { icon:"🆓", text:"Free credit check"          },
];

const CONSENT_TEXT = "I authorize secure retrieval of my business financial data through the RBI Account Aggregator Framework, solely for the purpose of this financial health assessment.";

// Shown above form/consent/loading so the owner always knows where they are in the journey.
const JOURNEY_STEPS = [
  { key:"form",    label:"Business Details" },
  { key:"consent", label:"Secure Consent"   },
  { key:"loading", label:"AI Analysis"      },
  { key:"result",  label:"Health Card"      },
];

function JourneyProgress({ phase, isMobile }) {
  const idx = JOURNEY_STEPS.findIndex(s => s.key === phase);
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"center",
      gap: isMobile ? 4 : 8, marginBottom:24, flexWrap:"wrap",
      maxWidth: isMobile ? 480 : 920, marginLeft:"auto", marginRight:"auto",
    }}>
      {JOURNEY_STEPS.map((s, i) => (
        <React.Fragment key={s.key}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <div style={{
              width: isMobile ? 20 : 24, height: isMobile ? 20 : 24, borderRadius:"50%",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize: isMobile ? 10 : 11, fontWeight:700, flexShrink:0,
              background: i < idx ? "#22c55e" : i === idx ? "#3b82f6" : "var(--c-surface-2)",
              color: i <= idx ? "#fff" : "#64748b",
            }}>{i < idx ? "✓" : i + 1}</div>
            {!isMobile && (
              <span style={{ fontSize:12, fontWeight: i === idx ? 700 : 400,
                color: i === idx ? "var(--c-text)" : "#64748b" }}>{s.label}</span>
            )}
          </div>
          {i < JOURNEY_STEPS.length - 1 && (
            <div style={{ width: isMobile ? 14 : 28, height:2,
              background: i < idx ? "#22c55e" : "var(--c-border)" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function MSMEPortal({ onBack, onResult }) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const saved = readSaved(user?.email);
  const [phase, setPhase] = useState(saved?.result ? "result" : "form");
  const [form, setForm] = useState(saved?.form || {
    business_name: "", proprietor_name: "", pan: "", mobile: "",
    gstin: "", business_type: "Textile", business_constitution: "Sole Proprietorship",
    city: "Mumbai", state: "Maharashtra", primary_bank: "HDFC Bank",
    years_in_business: 3,
  });
  // Many small shops/vendors aren't GST-registered at all (below the turnover
  // threshold) — let them still get scored on UPI/Bank AA + EPFO data alone.
  const [noGstin, setNoGstin] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [result, setResult] = useState(saved?.result || null);
  // animationDone tracks whether the loading animation has completed.
  // Both the animation callback and the API response set their respective flags;
  // the useEffect below transitions to "result" only when BOTH are true.
  const [animationDone, setAnimationDone] = useState(false);
  // Every business this owner has ever scored — lets them switch between
  // multiple shops instead of only ever seeing the last one checked.
  const [myBusinesses, setMyBusinesses] = useState([]);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const refreshHistory = () => {
    getHistory().then(res => setMyBusinesses(res.data || [])).catch(() => {});
  };

  // On mount: restore the saved result (if any) and load the full list of
  // businesses this owner has checked before.
  useEffect(() => {
    if (saved?.result) onResult?.(saved.result);
    refreshHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Transition to result screen once BOTH the API data AND the animation are ready.
  useEffect(() => {
    if (result && animationDone) {
      setPhase("result");
      onResult?.(result);  // lift result up so the AI assistant gets this score as context
      // Persist so the score survives tab switches / page refresh for this user.
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: user?.email, result, form }));
      } catch (e) { /* ignore */ }
      refreshHistory();  // pick up the newly-scored business in "Your Businesses"
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, animationDone, onResult]);

  // Switch straight to a previously-checked business without re-running the whole form/consent flow.
  const selectBusiness = (biz) => {
    setResult(biz);
    setAnimationDone(true);
    setPhase("result");
    onResult?.(biz);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ email: user?.email, result: biz, form }));
    } catch (e) { /* ignore */ }
  };

  const startFetch = async () => {
    setPhase("loading");
    setAnimationDone(false);
    try {
      const res = await generateScore({
        ...form,
        gstin: noGstin ? "" : form.gstin,
        has_gstin: !noGstin,
        consent_given: true,
      });
      setResult(res.data);
    } catch {
      alert("Backend unreachable. Is the server running on port 8000?");
      // Return to form so the user can retry, not to consent (they already consented).
      setPhase("form");
      setAnimationDone(false);
    }
  };

  // Called when the loading animation finishes (~5.5 s).
  const onLoadingDone = () => setAnimationDone(true);

  const onReset = () => {
    setPhase("form"); setResult(null); setAnimationDone(false); onResult?.(null);
    setForm({
      business_name: "", proprietor_name: "", pan: "", mobile: "",
      gstin: "", business_type: "Textile", business_constitution: "Sole Proprietorship",
      city: "Mumbai", state: "Maharashtra", primary_bank: "HDFC Bank",
      years_in_business: 3,
    });
    setNoGstin(false);
    setConsentChecked(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  };

  const mobileValid = /^[6-9]\d{9}$/.test(form.mobile);
  const panValid = /^[A-Z]{5}\d{4}[A-Z]$/.test(form.pan);
  const formValid = form.business_name && form.proprietor_name && mobileValid && panValid && (noGstin || form.gstin);

  /* ─── RESULT ─── */
  if (phase === "result" && result) {
    return <MSMEResult result={result} onReset={onReset} />;
  }

  /* ─── outer shell for form/consent/loading ─── */
  return (
    <div style={{ padding: isMobile ? "16px 12px" : "32px 24px" }}>
      <button onClick={onBack} style={{
        background:"transparent", border:"none", color:"#475569",
        fontSize:13, cursor:"pointer", marginBottom:20,
        display:"flex", alignItems:"center", gap:6,
      }}>↺ Start Over</button>

      {phase !== "result" && <JourneyProgress phase={phase} isMobile={isMobile} />}

      {/* ────── YOUR BUSINESSES ────── */}
      {phase === "form" && myBusinesses.length > 0 && (
        <div style={{
          maxWidth: isMobile ? 480 : 920, margin:"0 auto 20px",
          background:"var(--c-surface)", border:"1px solid var(--c-border)",
          borderRadius:20, padding: isMobile ? "18px 16px" : "22px 24px",
        }}>
          <div style={{ fontSize:11, color:"#475569", letterSpacing:1.5, marginBottom:12 }}>
            YOUR BUSINESSES ({myBusinesses.length})
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {myBusinesses.map((biz, i) => (
              <button key={biz.msme_id || i} onClick={() => selectBusiness(biz)} style={{
                display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
                width:"100%", textAlign:"left", cursor:"pointer",
                background:"var(--c-bg)", border:"1px solid var(--c-border)",
                borderRadius:12, padding:"10px 14px",
              }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--c-text)",
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {biz.business_name || "Untitled Business"}
                  </div>
                  <div style={{ fontSize:11, color:"#64748b" }}>
                    {biz.gstin} · {biz.city} · {biz.business_type}
                  </div>
                </div>
                <div style={{
                  flexShrink:0, fontSize:15, fontWeight:800,
                  color: biz.pillar_scores?.overall >= 70 ? "#22c55e"
                       : biz.pillar_scores?.overall >= 50 ? "#eab308" : "#ef4444",
                }}>
                  {biz.pillar_scores?.overall != null ? Math.round(biz.pillar_scores.overall) : "—"}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ────── FORM ────── */}
      {phase === "form" && (
        <div style={{
          maxWidth: isMobile ? 480 : 920,
          margin:"0 auto",
          display:"grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr",
          gap:20, alignItems:"start",
        }}>

          {/* Left: form card */}
          <div style={{
            background:"var(--c-surface)", border:"1px solid var(--c-border)",
            borderRadius:24, padding: isMobile ? "24px 20px" : "36px 32px",
          }}>
            <div style={{ marginBottom:28 }}>
              <div style={{ fontSize:11, color:"#3b82f6", letterSpacing:2, fontWeight:700, marginBottom:6 }}>
                AI-POWERED FINANCIAL HEALTH ASSESSMENT
              </div>
              <h2 style={{ fontSize: isMobile ? 22 : 28, fontWeight:800, color:"var(--c-text)", lineHeight:1.2 }}>
                Generate Your<br/>Financial Health Card
              </h2>
              <p style={{ fontSize:13, color:"#64748b", marginTop:8 }}>
                We analyze your business data with AI — no documents needed. Loan offers, if any, come after your score.
              </p>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
              <div>
                <label style={lbl}>BUSINESS NAME *</label>
                <input style={inp} value={form.business_name}
                  onChange={e => set("business_name", e.target.value)}
                  placeholder="e.g. Sharma Textiles Pvt. Ltd." />
              </div>

              <div>
                <label style={lbl}>PROPRIETOR / AUTHORIZED PERSON *</label>
                <input style={inp} value={form.proprietor_name}
                  onChange={e => set("proprietor_name", e.target.value)}
                  placeholder="e.g. Priya Sharma" />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={lbl}>BUSINESS PAN *</label>
                  <input style={inp} value={form.pan}
                    onChange={e => set("pan", e.target.value.toUpperCase())}
                    placeholder="e.g. ABCDE1234F" maxLength={10} />
                  {form.pan && !panValid && (
                    <div style={{ fontSize:10, color:"#ef4444", marginTop:4 }}>Format: AAAAA9999A</div>
                  )}
                </div>
                <div>
                  <label style={lbl}>REGISTERED MOBILE NUMBER *</label>
                  <input style={inp} value={form.mobile}
                    onChange={e => set("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="e.g. 9876543210" maxLength={10} />
                  {form.mobile && !mobileValid && (
                    <div style={{ fontSize:10, color:"#ef4444", marginTop:4 }}>Enter a valid 10-digit number</div>
                  )}
                </div>
              </div>

              <div>
                <label style={lbl}>GSTIN {!noGstin && "*"}</label>
                <input style={{ ...inp, opacity: noGstin ? 0.5 : 1 }} value={form.gstin}
                  disabled={noGstin}
                  onChange={e => set("gstin", e.target.value.toUpperCase())}
                  placeholder="e.g. 27AAPFU0939F1ZV" maxLength={15} />
                <div style={{ fontSize:11, color:"#475569", marginTop:4 }}>
                  15-digit GST Identification Number — we'll securely fetch your GST turnover automatically.
                </div>
                <label style={{
                  display:"flex", alignItems:"center", gap:8, marginTop:10,
                  fontSize:12, color:"#94a3b8", cursor:"pointer",
                }}>
                  <input type="checkbox" checked={noGstin}
                    onChange={e => { setNoGstin(e.target.checked); if (e.target.checked) set("gstin", ""); }} />
                  This business is not GST-registered
                </label>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={lbl}>BUSINESS CONSTITUTION</label>
                  <select style={inp} value={form.business_constitution}
                    onChange={e => set("business_constitution", e.target.value)}>
                    {CONSTITUTIONS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>INDUSTRY</label>
                  <select style={inp} value={form.business_type}
                    onChange={e => set("business_type", e.target.value)}>
                    {INDUSTRIES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={lbl}>CITY</label>
                  <select style={inp} value={form.city}
                    onChange={e => set("city", e.target.value)}>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>STATE</label>
                  <select style={inp} value={form.state}
                    onChange={e => set("state", e.target.value)}>
                    {STATES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={lbl}>PRIMARY BANK (for Account Aggregator link)</label>
                <select style={inp} value={form.primary_bank}
                  onChange={e => set("primary_bank", e.target.value)}>
                  {BANKS.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <label style={lbl}>
                  YEARS IN BUSINESS
                  <span style={{ color:"#3b82f6", marginLeft:8, fontSize:13 }}>
                    {form.years_in_business} {form.years_in_business === 1 ? "year" : "years"}
                  </span>
                </label>
                <input type="range" min={1} max={20} value={form.years_in_business}
                  onChange={e => set("years_in_business", parseInt(e.target.value))}
                  style={{ width:"100%", accentColor:"#3b82f6" }} />
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#475569" }}>
                  <span>1 yr</span><span>20 yrs</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setPhase("consent")}
              disabled={!formValid}
              style={{
                width:"100%", marginTop:28, padding:"16px",
                background: formValid
                  ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                  : "var(--c-surface-2)",
                border:"none", borderRadius:14,
                color: formValid ? "#fff" : "#475569",
                fontSize:15, fontWeight:700, cursor:"pointer",
                transition:"opacity 0.2s",
                boxShadow: formValid ? "0 4px 20px #3b82f633" : "none",
              }}>
              Generate My Financial Health Card →
            </button>

            {/* Quick benefits row */}
            <div style={{
              display:"flex", gap:12, marginTop:20, flexWrap:"wrap",
              justifyContent:"center",
            }}>
              {BENEFITS.map((b, i) => (
                <div key={i} style={{ fontSize:11, color:"#475569", display:"flex", alignItems:"center", gap:4 }}>
                  <span>{b.icon}</span><span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: info panel — desktop only */}
          {!isMobile && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* AI signals */}
              <div style={{
                background:"var(--c-surface)", border:"1px solid var(--c-border)",
                borderRadius:20, padding:"24px",
              }}>
                <div style={{ fontSize:11, color:"#475569", letterSpacing:1.5, marginBottom:16 }}>
                  AI FINANCIAL SIGNALS
                </div>
                {AI_SIGNALS.map((t, i) => (
                  <div key={i} style={{
                    display:"flex", alignItems:"center", gap:12,
                    padding:"10px 0",
                    borderBottom: i < AI_SIGNALS.length - 1 ? "1px solid var(--c-border-soft)" : "none",
                  }}>
                    <div style={{
                      width:36, height:36, borderRadius:10,
                      background:"var(--c-bg)", border:"1px solid var(--c-border)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:16, flexShrink:0,
                    }}>{t.icon}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, color:"#cbd5e1", fontWeight:600 }}>{t.label}</div>
                      <div style={{ fontSize:11, color:"#475569" }}>{t.sub}</div>
                    </div>
                    <span style={{
                      flexShrink:0, fontSize:9, fontWeight:700, letterSpacing:0.3,
                      padding:"3px 8px", borderRadius:20,
                      background:"#22c55e18", border:"1px solid #22c55e33", color:"#4ade80",
                    }}>AI</span>
                  </div>
                ))}
                <div style={{ fontSize:10.5, color:"#64748b", marginTop:12, lineHeight:1.5 }}>
                  Derived from GSTN, RBI Account Aggregator, NPCI (UPI), EPFO and Credit Bureau
                  data — connected only after you consent in the next step.
                </div>
              </div>

              {/* Trust badges */}
              <div style={{
                background:"linear-gradient(135deg, #0d2618, #0a1628)",
                border:"1px solid #15803d33", borderRadius:20, padding:"20px 24px",
              }}>
                <div style={{ fontSize:11, color:"#22c55e", letterSpacing:1.5, marginBottom:14 }}>
                  TRUSTED & SECURE
                </div>
                {[
                  ["🏦","RBI Account Aggregator Framework"],
                  ["🔐","256-bit SSL encryption"],
                  ["🤝","GSTN & NPCI certified"],
                  ["⚖️","No impact on credit score"],
                ].map(([icon, text], i) => (
                  <div key={i} style={{
                    display:"flex", alignItems:"center", gap:10,
                    marginBottom:10, fontSize:12, color:"#86efac",
                  }}>
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Score preview */}
              <div style={{
                background:"var(--c-surface)", border:"1px solid var(--c-border)",
                borderRadius:20, padding:"20px 24px",
              }}>
                <div style={{ fontSize:11, color:"#475569", letterSpacing:1.5, marginBottom:14 }}>
                  WHAT YOU'LL GET
                </div>
                {[
                  ["📊","Financial Health Score (0–100)"],
                  ["🎯","5-Pillar Explainable Breakdown"],
                  ["🤖","AI-Detected Risks & Strengths"],
                  ["📈","Peer Benchmarking"],
                  ["💰","Eligible Loan Amount"],
                  ["✅","Loan Application (via OCEN)"],
                ].map(([icon, text], i) => (
                  <div key={i} style={{
                    display:"flex", alignItems:"center", gap:10,
                    marginBottom:10, fontSize:12, color:"#94a3b8",
                  }}>
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ────── CONSENT ────── */}
      {phase === "consent" && (
        <div style={{ maxWidth:520, margin:"0 auto" }}>
          <div style={{
            background:"var(--c-surface)", border:"1px solid var(--c-border)",
            borderRadius:24, overflow:"hidden",
          }}>
            {/* Header */}
            <div style={{
              background:"linear-gradient(135deg, #1e3a5f, #1a0f3d)",
              padding:"32px", textAlign:"center",
            }}>
              <div style={{
                width:64, height:64, borderRadius:18,
                background:"#15803d22", border:"2px solid #22c55e44",
                margin:"0 auto 16px",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:28,
              }}>🔐</div>
              <h2 style={{ fontSize:22, fontWeight:800, color:"#f1f5f9", marginBottom:6 }}>
                Data Sharing Consent
              </h2>
              <div style={{ fontSize:12, color:"#cbd5e1" }}>
                As per RBI Account Aggregator framework
              </div>
            </div>

            <div style={{ padding:"28px" }}>
              <div style={{
                background:"var(--c-bg)", border:"1px solid var(--c-border)",
                borderRadius:14, padding:"20px", marginBottom:20,
              }}>
                <div style={{ fontSize:12, color:"#94a3b8", marginBottom:14, lineHeight:1.5 }}>
                  <strong style={{ color:"var(--c-text)" }}>{form.business_name}</strong>, you are
                  consenting to share the following data solely for financial health assessment:
                </div>
                {TRUST_ITEMS.filter(item => !noGstin || item.label !== "GST Revenue Data").map((item, i, arr) => (
                  <div key={i} style={{
                    display:"flex", alignItems:"center", gap:10,
                    padding:"9px 0",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--c-border-soft)" : "none",
                  }}>
                    <div style={{
                      width:30, height:30, borderRadius:8, background:"#15803d11",
                      border:"1px solid #15803d33", display:"flex",
                      alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0,
                    }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize:12, color:"#cbd5e1", fontWeight:600 }}>{item.label}</div>
                      <div style={{ fontSize:10, color:"#475569" }}>{item.sub}</div>
                    </div>
                    <span style={{ marginLeft:"auto", color:"#22c55e", fontSize:14 }}>✓</span>
                  </div>
                ))}
              </div>

              <div style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"12px 16px",
                background:"#15803d11", border:"1px solid #15803d33",
                borderRadius:12, fontSize:12, color:"#86efac",
                marginBottom:20,
              }}>
                <span style={{ fontSize:18 }}>🔒</span>
                <div>
                  <div style={{ fontWeight:600 }}>Consent valid for 90 days</div>
                  <div style={{ color:"#4ade8088", fontSize:11 }}>
                    Revocable at any time. Data used only for this assessment.
                  </div>
                </div>
              </div>

              <label style={{
                display:"flex", alignItems:"flex-start", gap:10,
                padding:"14px 16px", marginBottom:24,
                background:"var(--c-bg)", border:`1px solid ${consentChecked ? "#22c55e55" : "var(--c-border)"}`,
                borderRadius:12, cursor:"pointer",
              }}>
                <input type="checkbox" checked={consentChecked}
                  onChange={e => setConsentChecked(e.target.checked)}
                  style={{ marginTop:2, flexShrink:0, accentColor:"#22c55e" }} />
                <span style={{ fontSize:12, color:"#94a3b8", lineHeight:1.5 }}>{CONSENT_TEXT}</span>
              </label>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:12 }}>
                <button onClick={() => setPhase("form")} style={{
                  padding:"14px", background:"transparent",
                  border:"1px solid var(--c-border)", borderRadius:12,
                  color:"#94a3b8", fontSize:14, cursor:"pointer",
                }}>← Back</button>
                <button onClick={startFetch} disabled={!consentChecked} style={{
                  padding:"14px",
                  background: consentChecked ? "linear-gradient(135deg, #22c55e, #16a34a)" : "var(--c-surface-2)",
                  border:"none", borderRadius:12,
                  color: consentChecked ? "#fff" : "#475569", fontSize:14, fontWeight:700,
                  cursor: consentChecked ? "pointer" : "not-allowed",
                  boxShadow: consentChecked ? "0 4px 16px #22c55e33" : "none",
                }}>✓ Agree &amp; Generate Health Card</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ────── LOADING ────── */}
      {phase === "loading" && (
        <div style={{ maxWidth:480, margin:"0 auto" }}>
          <div style={{
            background:"var(--c-surface)", border:"1px solid var(--c-border)",
            borderRadius:24, padding:"40px 32px",
          }}>
            <div style={{ textAlign:"center", marginBottom:32 }}>
              <div style={{ fontSize:11, color:"#3b82f6", letterSpacing:2, marginBottom:8 }}>
                AI ANALYSIS IN PROGRESS
              </div>
              <h2 style={{ fontSize:20, fontWeight:700, color:"var(--c-text)" }}>
                Generating Your Financial Health Card
              </h2>
              <p style={{ fontSize:13, color:"#64748b", marginTop:6 }}>
                Analyzing 50+ data points across 5 pillars
              </p>
            </div>
            <LoadingSteps onComplete={onLoadingDone} />
          </div>
        </div>
      )}
    </div>
  );
}
