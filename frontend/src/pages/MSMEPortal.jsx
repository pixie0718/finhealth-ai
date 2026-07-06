import React, { useState, useEffect } from "react";
import { generateScore } from "../api/client";
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

const BUSINESS_TYPES = ["Textile","Pharma","Electronics","Food Processing","Retail","Construction","IT Services","Logistics"];
const CITIES = ["Mumbai","Delhi","Surat","Ahmedabad","Pune","Bangalore","Chennai","Hyderabad","Kolkata","Jaipur"];

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

const BENEFITS = [
  { icon:"⚡", text:"Results in 60 seconds"     },
  { icon:"📄", text:"No documents required"      },
  { icon:"🔒", text:"Bank-grade encryption"      },
  { icon:"🆓", text:"Free credit check"          },
];

export default function MSMEPortal({ onBack, onResult }) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const saved = readSaved(user?.email);
  const [phase, setPhase] = useState(saved?.result ? "result" : "form");
  const [form, setForm] = useState(saved?.form || {
    business_name: "", gstin: "", business_type: "Textile",
    city: "Mumbai", years_in_business: 3,
  });
  const [result, setResult] = useState(saved?.result || null);
  // animationDone tracks whether the loading animation has completed.
  // Both the animation callback and the API response set their respective flags;
  // the useEffect below transitions to "result" only when BOTH are true.
  const [animationDone, setAnimationDone] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // On mount, if a saved result was restored, hand it to the AI assistant too.
  useEffect(() => {
    if (saved?.result) onResult?.(saved.result);
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result, animationDone, onResult]);

  const startFetch = async () => {
    setPhase("loading");
    setAnimationDone(false);
    try {
      const res = await generateScore({ ...form, consent_given: true });
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
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  };

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
                MSME LOAN APPLICATION
              </div>
              <h2 style={{ fontSize: isMobile ? 22 : 28, fontWeight:800, color:"var(--c-text)", lineHeight:1.2 }}>
                Check Your<br/>Loan Eligibility
              </h2>
              <p style={{ fontSize:13, color:"#64748b", marginTop:8 }}>
                We fetch data automatically — no documents needed.
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
                <label style={lbl}>GSTIN *</label>
                <input style={inp} value={form.gstin}
                  onChange={e => set("gstin", e.target.value.toUpperCase())}
                  placeholder="e.g. 27AAPFU0939F1ZV" maxLength={15} />
                <div style={{ fontSize:11, color:"#475569", marginTop:4 }}>
                  15-digit GST Identification Number
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <label style={lbl}>BUSINESS TYPE</label>
                  <select style={inp} value={form.business_type}
                    onChange={e => set("business_type", e.target.value)}>
                    {BUSINESS_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>CITY</label>
                  <select style={inp} value={form.city}
                    onChange={e => set("city", e.target.value)}>
                    {CITIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
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
              disabled={!form.business_name || !form.gstin}
              style={{
                width:"100%", marginTop:28, padding:"16px",
                background: form.business_name && form.gstin
                  ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                  : "var(--c-surface-2)",
                border:"none", borderRadius:14,
                color: form.business_name && form.gstin ? "#fff" : "#475569",
                fontSize:15, fontWeight:700, cursor:"pointer",
                transition:"opacity 0.2s",
                boxShadow: form.business_name && form.gstin ? "0 4px 20px #3b82f633" : "none",
              }}>
              Continue → Get My Score
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

              {/* Data sources */}
              <div style={{
                background:"var(--c-surface)", border:"1px solid var(--c-border)",
                borderRadius:20, padding:"24px",
              }}>
                <div style={{ fontSize:11, color:"#475569", letterSpacing:1.5, marginBottom:16 }}>
                  DATA WE FETCH
                </div>
                {TRUST_ITEMS.map((t, i) => (
                  <div key={i} style={{
                    display:"flex", alignItems:"center", gap:12,
                    padding:"10px 0",
                    borderBottom: i < TRUST_ITEMS.length - 1 ? "1px solid var(--c-border-soft)" : "none",
                  }}>
                    <div style={{
                      width:36, height:36, borderRadius:10,
                      background:"var(--c-bg)", border:"1px solid var(--c-border)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:16, flexShrink:0,
                    }}>{t.icon}</div>
                    <div>
                      <div style={{ fontSize:13, color:"#cbd5e1", fontWeight:600 }}>{t.label}</div>
                      <div style={{ fontSize:11, color:"#475569" }}>{t.sub}</div>
                    </div>
                  </div>
                ))}
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
                  ["💰","Eligible Loan Amount"],
                  ["🎯","5-Pillar Breakdown"],
                  ["🤖","AI-Powered Explanation"],
                  ["📈","Peer Benchmarking"],
                  ["✅","Instant Loan Application"],
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
                  consenting to share the following data for credit assessment:
                </div>
                {TRUST_ITEMS.map((item, i) => (
                  <div key={i} style={{
                    display:"flex", alignItems:"center", gap:10,
                    padding:"9px 0",
                    borderBottom: i < TRUST_ITEMS.length - 1 ? "1px solid var(--c-border-soft)" : "none",
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
                marginBottom:24,
              }}>
                <span style={{ fontSize:18 }}>🔒</span>
                <div>
                  <div style={{ fontWeight:600 }}>Consent valid for 90 days</div>
                  <div style={{ color:"#4ade8088", fontSize:11 }}>
                    Revocable at any time. Data used only for this assessment.
                  </div>
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1.4fr", gap:12 }}>
                <button onClick={() => setPhase("form")} style={{
                  padding:"14px", background:"transparent",
                  border:"1px solid var(--c-border)", borderRadius:12,
                  color:"#94a3b8", fontSize:14, cursor:"pointer",
                }}>← Back</button>
                <button onClick={startFetch} style={{
                  padding:"14px",
                  background:"linear-gradient(135deg, #22c55e, #16a34a)",
                  border:"none", borderRadius:12,
                  color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer",
                  boxShadow:"0 4px 16px #22c55e33",
                }}>✓ Agree & Get Score</button>
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
                PROCESSING YOUR APPLICATION
              </div>
              <h2 style={{ fontSize:20, fontWeight:700, color:"var(--c-text)" }}>
                Fetching Your Financial Data
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
