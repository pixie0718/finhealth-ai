import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";
import Reveal from "../components/Reveal";
import CountUp from "../components/CountUp";

const STATS = [
  { end: 10000, separator: true, suffix: "+", label: "MSMEs Assessed" },
  { end: 98.2, decimals: 1, suffix: "%", label: "ML Accuracy" },
  { end: 30, prefix: "< ", suffix: "s", label: "Score Generated" },
  { end: 11, label: "Loan Products" },
];

// Animated score ring for the hero mock card — counts up + fills when in view.
function HeroScoreRing() {
  const ref = useRef(null);
  const started = useRef(false);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (now) => {
          const t = Math.min(1, (now - t0) / 1500);
          setV(84 * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(tick); else setV(84);
        };
        requestAnimationFrame(tick);
        io.disconnect();
      }
    }), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const deg = (v / 100) * 360;
  return (
    <div ref={ref} style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
      <div style={{ width: 96, height: 96, borderRadius: "50%", background: `conic-gradient(#22c55e ${deg}deg, #1e293b ${deg}deg)`, transition: "background 0.1s linear" }} />
      <div style={{ position: "absolute", inset: 7, borderRadius: "50%", background: "#0d1526", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#f1f5f9", lineHeight: 1 }}>{Math.round(v)}</div>
        <div style={{ fontSize: 8.5, color: "#64748b", letterSpacing: 0.5 }}>/ 100</div>
      </div>
    </div>
  );
}

const DATA_SOURCES = [
  { icon: "📊", label: "GST Network", desc: "Filing history & turnover" },
  { icon: "🏦", label: "Account Aggregator", desc: "RBI AA consented pull" },
  { icon: "📱", label: "UPI / NPCI", desc: "Cash-flow & bounce data" },
  { icon: "👥", label: "EPFO", desc: "Payroll & headcount" },
  { icon: "💳", label: "Credit Bureau", desc: "CIBIL when available" },
];

const FEATURES = [
  { icon: "⚡", title: "Instant Score from GSTIN", desc: "Type a GST number and get a 0–100 financial health score in seconds — no balance sheets, no paperwork, no branch visit." },
  { icon: "🧩", title: "5-Pillar Breakdown", desc: "Every score is split into Cash Flow, Compliance, Growth, Stability and Credit Worthiness — so you see exactly what drives it." },
  { icon: "🔍", title: "Explainable AI (SHAP)", desc: "Not a black box. Each decision shows the top factors pushing the score up or down, in plain language." },
  { icon: "💰", title: "Loan Eligibility & Products", desc: "Get an eligible loan amount, a risk band, and matched products — including MUDRA, CGTMSE and Stand-Up India schemes." },
  { icon: "🌱", title: "New-to-Credit Fairness", desc: "No CIBIL history? We re-weight the score around GST & cash-flow instead of rejecting you — credit access for first-timers." },
  { icon: "🤖", title: "Built-in AI Assistant", desc: "Ask questions about any score, loan option or improvement tip and get instant answers from a Gemini-powered advisor." },
];

const STEPS = [
  { n: "1", title: "Enter GSTIN & Consent", desc: "The business owner shares their GSTIN and gives RBI-AA consent to pull data." },
  { n: "2", title: "Alternate Data Fetched", desc: "GST, UPI/bank, EPFO and credit-bureau data are pulled via the Account Aggregator framework." },
  { n: "3", title: "AI Scores & Explains", desc: "An XGBoost model scores the 5 pillars and SHAP explains the key drivers." },
  { n: "4", title: "Decision in Seconds", desc: "Owner sees loan eligibility; the bank officer gets an explainable, audit-ready credit report." },
];

const accent = "#3b82f6";

const HERO_PILLARS = [
  { label: "Cash Flow", val: 82, color: "#3b82f6" },
  { label: "Compliance", val: 91, color: "#8b5cf6" },
  { label: "Growth", val: 76, color: "#06b6d4" },
  { label: "Stability", val: 84, color: "#f59e0b" },
];

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Landing() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div style={{ background: "#0a0f1e", color: "#e2e8f0", minHeight: "100vh" }}>

      {/* ─── Header ─────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(10,15,30,0.85)", backdropFilter: "blur(10px)",
        borderBottom: "1px solid #1e293b",
      }}>
        <div style={{
          maxWidth: 1160, margin: "0 auto", padding: "0 24px", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => scrollTo("top")}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
            }}>📊</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9" }}>FinHealth <span style={{ color: accent }}>AI</span></div>
          </div>

          {!isMobile && (
            <nav style={{ display: "flex", gap: 28 }}>
              {[["Features", "features"], ["How it Works", "how"], ["Who it's For", "audience"], ["Security", "security"]].map(([label, id]) => (
                <button key={id} onClick={() => scrollTo(id)} style={{
                  background: "none", border: "none", color: "#94a3b8", fontSize: 13.5,
                  cursor: "pointer", fontWeight: 500,
                }}>{label}</button>
              ))}
            </nav>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => navigate("/owner/login")} style={{
              background: "transparent", border: "1px solid #334155", color: "#cbd5e1",
              padding: "8px 14px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>{isMobile ? "Business" : "Business Login"}</button>
            <button onClick={() => navigate("/manager/login")} style={{
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", border: "none", color: "#fff",
              padding: "8px 14px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>{isMobile ? "Bank" : "Bank Login"}</button>
          </div>
        </div>
      </header>

      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section id="top" style={{ position: "relative", overflow: "hidden", padding: isMobile ? "36px 20px 44px" : "64px 24px 60px" }}>
        {/* subtle grid pattern */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(#ffffff08 1px, transparent 1px), linear-gradient(90deg, #ffffff08 1px, transparent 1px)",
          backgroundSize: "46px 46px",
          maskImage: "radial-gradient(ellipse 75% 65% at 50% 0%, #000 35%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 50% 0%, #000 35%, transparent 100%)",
        }} />
        {/* drifting glow blobs */}
        <div style={{ position: "absolute", top: "-18%", left: "2%", width: 540, height: 540, background: "radial-gradient(circle, #3b82f630 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", animation: "fhDrift1 15s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "8%", right: "-4%", width: 500, height: 500, background: "radial-gradient(circle, #8b5cf630 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none", animation: "fhDrift2 18s ease-in-out infinite" }} />

        <div style={{
          maxWidth: 1120, margin: "0 auto", position: "relative", zIndex: 1,
          display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr",
          gap: isMobile ? 34 : 48, alignItems: "center",
        }}>
          {/* LEFT — copy */}
          <div style={{ textAlign: isMobile ? "center" : "left", animation: "fhFadeUp 0.6s ease-out both" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#1e293b88", border: "1px solid #3b82f644", backdropFilter: "blur(6px)",
              padding: "6px 16px", borderRadius: 20, marginBottom: 22,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
              <span style={{ fontSize: 11.5, color: "#94a3b8", letterSpacing: 0.2 }}>Powered by RBI Account Aggregator · IDBI Innovate 2026</span>
            </div>

            <h1 style={{ fontSize: isMobile ? 36 : 56, fontWeight: 900, color: "#f8fafc", letterSpacing: -2, lineHeight: 1.06, marginBottom: 20 }}>
              Loan-ready in <span style={{ background: "linear-gradient(110deg, #3b82f6, #8b5cf6, #06b6d4, #8b5cf6, #3b82f6)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "fhShimmer 4s linear infinite" }}>30 seconds.</span>
              <br />Not 30 days.
            </h1>

            <p style={{ fontSize: isMobile ? 15.5 : 18, color: "#94a3b8", maxWidth: 520, margin: isMobile ? "0 auto 28px" : "0 0 30px", lineHeight: 1.65 }}>
              FinHealth AI turns a business's GST, UPI &amp; bank data into an instant, explainable credit score —
              so India's MSMEs get faster loans and banks lend with confidence.
              <strong style={{ color: "#e2e8f0" }}> No documents. No branch visits.</strong>
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-start" }}>
              <button onClick={() => navigate("/owner/login")} style={{
                background: "linear-gradient(135deg, #3b82f6, #6366f1)", border: "none", color: "#fff",
                padding: "14px 26px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 10px 34px #3b82f655",
              }}>Get My Business Score →</button>
              <button onClick={() => navigate("/manager/login")} style={{
                background: "#1e293baa", border: "1px solid #334155", color: "#e2e8f0", backdropFilter: "blur(6px)",
                padding: "14px 26px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer",
              }}>🏦 I'm a Bank Officer</button>
            </div>

            {/* data source chips */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 26, justifyContent: isMobile ? "center" : "flex-start" }}>
              <span style={{ fontSize: 11, color: "#475569", alignSelf: "center", marginRight: 2 }}>Reads:</span>
              {["📊 GST", "📱 UPI", "🏦 Bank (AA)", "👥 EPFO", "💳 CIBIL"].map((t) => (
                <span key={t} style={{ fontSize: 11.5, color: "#94a3b8", background: "#111a2e", border: "1px solid #1e293b", padding: "5px 12px", borderRadius: 20 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* RIGHT — live product mockup */}
          <div style={{ display: "flex", justifyContent: "center", animation: "fhFadeUp 0.7s 0.15s ease-out both" }}>
            <div style={{ position: "relative", width: "100%", maxWidth: 380 }}>
              {/* floating chips */}
              <div style={{
                position: "absolute", top: -14, right: isMobile ? 6 : -14, zIndex: 3,
                background: "#0d2618", border: "1px solid #22c55e55", color: "#4ade80",
                fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 20,
                boxShadow: "0 8px 24px #00000055", animation: "fhFloat 4s ease-in-out infinite",
              }}>✓ GST verified</div>
              <div style={{
                position: "absolute", bottom: 64, left: isMobile ? 4 : -18, zIndex: 3,
                background: "#1a1140", border: "1px solid #8b5cf655", color: "#c4b5fd",
                fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 20,
                boxShadow: "0 8px 24px #00000055", animation: "fhFloat 4.6s 0.6s ease-in-out infinite",
              }}>🤖 SHAP explained</div>

              {/* the card */}
              <div style={{
                background: "linear-gradient(160deg, #131d33, #0d1526)",
                border: "1px solid #2a3a5f", borderRadius: 22, padding: 24,
                boxShadow: "0 30px 70px #00000088, inset 0 1px 0 #ffffff0f",
                animation: "fhFloat 6s ease-in-out infinite",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
                  <div>
                    <div style={{ fontSize: 9.5, color: "#64748b", letterSpacing: 1.2, fontWeight: 700 }}>FINANCIAL HEALTH REPORT</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", marginTop: 3 }}>Sharma Textiles</div>
                    <div style={{ fontSize: 10.5, color: "#475569", marginTop: 1 }}>27AAPFU0939F1ZV · Surat</div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: "#22c55e", background: "#15803d22", border: "1px solid #15803d55", padding: "3px 10px", borderRadius: 20 }}>LOW RISK</div>
                </div>

                {/* score ring + grade */}
                <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
                  <HeroScoreRing />
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#4ade80" }}>Grade A · Excellent</div>
                    <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 4 }}>Eligible loan amount</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: "#f1f5f9" }}>₹18.5L</div>
                  </div>
                </div>

                {/* pillar bars */}
                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 18 }}>
                  {HERO_PILLARS.map((p) => (
                    <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 72, fontSize: 11, color: "#94a3b8" }}>{p.label}</div>
                      <div style={{ flex: 1, height: 6, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${p.val}%`, height: "100%", background: p.color, borderRadius: 4, animation: "fhGrow 1.1s ease-out" }} />
                      </div>
                      <div style={{ width: 22, fontSize: 11, fontWeight: 700, color: "#cbd5e1", textAlign: "right" }}>{p.val}</div>
                    </div>
                  ))}
                </div>

                <button onClick={() => navigate("/owner/login")} style={{
                  width: "100%", background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none",
                  color: "#fff", padding: "11px", borderRadius: 12, fontSize: 13.5, fontWeight: 800, cursor: "pointer",
                }}>✓ APPROVED — Apply Now</button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{
          maxWidth: 900, margin: isMobile ? "40px auto 0" : "52px auto 0", display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
          background: "#111a2ecc", border: "1px solid #1e293b", borderRadius: 16, overflow: "hidden", position: "relative", zIndex: 1, backdropFilter: "blur(6px)",
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ padding: "20px 16px", textAlign: "center", borderRight: !isMobile && i < STATS.length - 1 ? "1px solid #1e293b" : "none", borderBottom: isMobile && i < 2 ? "1px solid #1e293b" : "none" }}>
              <CountUp end={s.end} decimals={s.decimals || 0} prefix={s.prefix || ""} suffix={s.suffix || ""} separator={s.separator}
                style={{ fontSize: 25, fontWeight: 900, background: "linear-gradient(135deg, #93c5fd, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block" }} />
              <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── What is it ─────────────────────────────────────────── */}
      <section style={{ padding: "60px 24px", borderTop: "1px solid #111a2e" }}>
        <Reveal style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: accent, fontWeight: 700, marginBottom: 14 }}>WHAT IS FINHEALTH AI?</div>
          <h2 style={{ fontSize: isMobile ? 26 : 30, fontWeight: 800, color: "#f1f5f9", lineHeight: 1.3, marginBottom: 18 }}>
            43 million Indian MSMEs are "credit invisible". We fix that.
          </h2>
          <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.75 }}>
            Most small businesses can't get a loan because they lack formal balance sheets or a CIBIL history.
            FinHealth AI reads the <strong style={{ color: "#cbd5e1" }}>alternate data they already generate</strong> —
            GST returns, UPI transactions, EPFO payroll — and produces a bank-grade credit assessment with a clear,
            explainable reason for every score. Built for the <strong style={{ color: "#cbd5e1" }}>RBI Account Aggregator</strong> framework,
            it serves both the business owner and the lending officer.
          </p>
        </Reveal>
      </section>

      {/* ─── Features ───────────────────────────────────────────── */}
      <section id="features" style={{ padding: "60px 24px", background: "#0b1120", borderTop: "1px solid #111a2e" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ fontSize: 12, letterSpacing: 2, color: accent, fontWeight: 700, marginBottom: 12 }}>WHAT IT CAN DO</div>
            <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800, color: "#f1f5f9" }}>Everything you need to assess credit, fast</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={(i % 3) * 0.09}>
                <div style={{
                  background: "#111a2e", border: "1px solid #1e293b", borderRadius: 18, padding: 26,
                  transition: "all 0.25s", height: "100%",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3b82f677"; e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 44px #3b82f622"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, marginBottom: 16, fontSize: 24,
                    background: "linear-gradient(135deg, #3b82f622, #8b5cf622)", border: "1px solid #3b82f633",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>{f.icon}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ───────────────────────────────────────── */}
      <section id="how" style={{ padding: "60px 24px", borderTop: "1px solid #111a2e" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ fontSize: 12, letterSpacing: 2, color: accent, fontWeight: 700, marginBottom: 12 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800, color: "#f1f5f9" }}>From GSTIN to decision in four steps</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(230px, 1fr))", gap: 20 }}>
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={{ background: "#111a2e", border: "1px solid #1e293b", borderRadius: 18, padding: 24, position: "relative", height: "100%", transition: "all 0.25s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#8b5cf655"; e.currentTarget.style.transform = "translateY(-5px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%", marginBottom: 16,
                    background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800,
                    boxShadow: "0 6px 20px #3b82f655",
                  }}>{s.n}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Data sources */}
          <div style={{ marginTop: 40, background: "#0b1120", border: "1px solid #1e293b", borderRadius: 18, padding: "28px 24px" }}>
            <div style={{ textAlign: "center", fontSize: 12, letterSpacing: 1.5, color: "#64748b", marginBottom: 22 }}>
              POWERED BY CONSENTED ALTERNATE DATA
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
              {DATA_SOURCES.map((s) => (
                <div key={s.label} style={{
                  display: "flex", alignItems: "center", gap: 12, background: "#111a2e",
                  border: "1px solid #1e293b", borderRadius: 12, padding: "12px 18px", minWidth: 210,
                }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "#e2e8f0" }}>{s.label}</div>
                    <div style={{ fontSize: 11.5, color: "#64748b" }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Who it's for (role cards) ──────────────────────────── */}
      <section id="audience" style={{ padding: "60px 24px", background: "#0b1120", borderTop: "1px solid #111a2e" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 12, letterSpacing: 2, color: accent, fontWeight: 700, marginBottom: 12 }}>WHO IT'S FOR</div>
            <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800, color: "#f1f5f9" }}>Two portals, one platform</h2>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
            {/* Business Owner */}
            <Reveal delay={0}><div onClick={() => navigate("/owner/login")} style={{
              height: "100%", boxSizing: "border-box",
              background: "linear-gradient(135deg, #1e293b, #0f1f3d)", border: "1px solid #1e3a5f",
              borderRadius: 22, padding: 32, cursor: "pointer", transition: "all 0.3s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; e.currentTarget.style.transform = "translateY(-5px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1e3a5f"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 16, marginBottom: 18, fontSize: 26, background: "#3b82f618", border: "1px solid #3b82f633", display: "flex", alignItems: "center", justifyContent: "center" }}>🏭</div>
              <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>BUSINESS OWNER</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", marginBottom: 10 }}>Check Loan Eligibility</h3>
              <p style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.7, marginBottom: 18 }}>
                Get your Financial Health Score, see how much you can borrow, and learn exactly what to improve — instantly, using just your GSTIN.
              </p>
              <div style={{ fontSize: 13, color: "#3b82f6", fontWeight: 700 }}>Get My Score →</div>
            </div></Reveal>

            {/* Bank Manager */}
            <Reveal delay={0.12}><div onClick={() => navigate("/manager/login")} style={{
              height: "100%", boxSizing: "border-box",
              background: "linear-gradient(135deg, #1e293b, #1a0f3d)", border: "1px solid #2d1f5e",
              borderRadius: 22, padding: 32, cursor: "pointer", transition: "all 0.3s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#8b5cf6"; e.currentTarget.style.transform = "translateY(-5px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2d1f5e"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ width: 56, height: 56, borderRadius: 16, marginBottom: 18, fontSize: 26, background: "#8b5cf618", border: "1px solid #8b5cf633", display: "flex", alignItems: "center", justifyContent: "center" }}>🏦</div>
              <div style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>BANK MANAGER</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", marginBottom: 10 }}>Review Applications</h3>
              <p style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.7, marginBottom: 18 }}>
                AI-scored, SHAP-explained credit reports with a portfolio dashboard, loan-outcome tracking and one-click PDF exports for faster, fairer decisions.
              </p>
              <div style={{ fontSize: 13, color: "#8b5cf6", fontWeight: 700 }}>Open Console →</div>
            </div></Reveal>
          </div>
        </div>
      </section>

      {/* ─── Security / trust ───────────────────────────────────── */}
      <section id="security" style={{ padding: "60px 24px", borderTop: "1px solid #111a2e" }}>
        <Reveal style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: accent, fontWeight: 700, marginBottom: 14 }}>PRIVACY & SECURITY</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: "#f1f5f9", marginBottom: 18 }}>Consent-first, by design</h2>
          <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.75, marginBottom: 32 }}>
            Data is only ever pulled with the business's explicit consent through the RBI Account Aggregator framework.
            Every assessment mints a signed, time-bound consent artifact — fully auditable and revocable.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
            {["🔒 RBI AA Framework", "📝 Signed Consent Artifact", "⏱ 90-Day Data Life", "🧾 Purpose-Bound Access", "🔑 JWT-Secured Access"].map((t) => (
              <span key={t} style={{
                fontSize: 13, color: "#cbd5e1", background: "#111a2e",
                border: "1px solid #1e293b", padding: "8px 16px", borderRadius: 20,
              }}>{t}</span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ─── CTA band ───────────────────────────────────────────── */}
      <section style={{ padding: "24px 24px 64px" }}>
        <Reveal style={{
          maxWidth: 1000, margin: "0 auto", textAlign: "center",
          background: "linear-gradient(135deg, #1e293b, #1a1240)", border: "1px solid #3b82f644",
          borderRadius: 24, padding: isMobile ? "36px 22px" : "48px 32px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{ position: "absolute", top: "-40%", left: "50%", width: 400, height: 400, transform: "translateX(-50%)", background: "radial-gradient(circle, #6366f130 0%, transparent 70%)", pointerEvents: "none" }} />
          <h2 style={{ fontSize: 30, fontWeight: 900, color: "#f1f5f9", marginBottom: 12 }}>Ready to see your score?</h2>
          <p style={{ fontSize: 15, color: "#94a3b8", marginBottom: 26 }}>It takes under 30 seconds. No documents required.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/owner/login")} style={{
              background: "linear-gradient(135deg, #3b82f6, #06b6d4)", border: "none", color: "#fff",
              padding: "14px 30px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 30px #3b82f644",
            }}>Get My Business Score →</button>
            <button onClick={() => navigate("/manager/login")} style={{
              background: "transparent", border: "1px solid #475569", color: "#e2e8f0",
              padding: "14px 30px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}>Bank Officer Login</button>
          </div>
        </Reveal>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid #1e293b", background: "#0a0f1e", padding: "40px 24px 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 32, marginBottom: 32 }}>
            <div style={{ maxWidth: 300 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>📊</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#f1f5f9" }}>FinHealth <span style={{ color: accent }}>AI</span></div>
              </div>
              <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>
                Explainable MSME credit scoring on alternate data. Built for IDBI Innovate 2026.
              </p>
            </div>

            <div style={{ display: "flex", gap: 56, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 12, color: "#475569", letterSpacing: 1, marginBottom: 12, fontWeight: 700 }}>PRODUCT</div>
                {[["Features", "features"], ["How it Works", "how"], ["Who it's For", "audience"], ["Security", "security"]].map(([l, id]) => (
                  <div key={id} onClick={() => scrollTo(id)} style={{ fontSize: 13.5, color: "#94a3b8", marginBottom: 9, cursor: "pointer" }}>{l}</div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#475569", letterSpacing: 1, marginBottom: 12, fontWeight: 700 }}>GET STARTED</div>
                <div onClick={() => navigate("/owner/login")} style={{ fontSize: 13.5, color: "#94a3b8", marginBottom: 9, cursor: "pointer" }}>Business Owner Login</div>
                <div onClick={() => navigate("/manager/login")} style={{ fontSize: 13.5, color: "#94a3b8", marginBottom: 9, cursor: "pointer" }}>Bank Manager Login</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#475569", letterSpacing: 1, marginBottom: 12, fontWeight: 700 }}>BUILT WITH</div>
                {["XGBoost + SHAP", "FastAPI + React", "Google Gemini", "RBI AA Framework"].map((t) => (
                  <div key={t} style={{ fontSize: 13.5, color: "#94a3b8", marginBottom: 9 }}>{t}</div>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            borderTop: "1px solid #1e293b", paddingTop: 20,
            display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 12,
          }}>
            <div style={{ fontSize: 12.5, color: "#475569" }}>© 2026 FinHealth AI · IDBI Innovate 2026 · Prototype</div>
            <div style={{ fontSize: 12.5, color: "#475569" }}>🔒 RBI Account Aggregator Compliant</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
