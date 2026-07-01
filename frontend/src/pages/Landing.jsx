import React from "react";
import { useNavigate } from "react-router-dom";
import useIsMobile from "../hooks/useIsMobile";

const STATS = [
  { value: "10,000+", label: "MSMEs Assessed" },
  { value: "98.2%", label: "ML Accuracy" },
  { value: "< 30s", label: "Score Generated" },
  { value: "11", label: "Loan Products" },
];

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
      <section id="top" style={{ position: "relative", overflow: "hidden", padding: "80px 24px 64px" }}>
        <div style={{ position: "absolute", top: "-10%", left: "15%", width: 500, height: 500, background: "radial-gradient(circle, #3b82f618 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-20%", right: "10%", width: 460, height: 460, background: "radial-gradient(circle, #8b5cf618 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#1e293b", border: "1px solid #3b82f633",
            padding: "6px 18px", borderRadius: 20, marginBottom: 26,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
            <span style={{ fontSize: 12, color: "#94a3b8" }}>IDBI Bank &nbsp;•&nbsp; RBI AA Compliant &nbsp;•&nbsp; IDBI Innovate 2026</span>
          </div>

          <h1 style={{ fontSize: isMobile ? 34 : 54, fontWeight: 900, color: "#f1f5f9", letterSpacing: -2, lineHeight: 1.08, marginBottom: 20 }}>
            Credit scores for MSMEs,<br />from{" "}
            <span style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              data they already have
            </span>
          </h1>

          <p style={{ fontSize: 18, color: "#94a3b8", maxWidth: 620, margin: "0 auto 32px", lineHeight: 1.65 }}>
            FinHealth AI turns a business's GST, UPI and Account-Aggregator data into an instant, explainable
            financial health score — so small businesses get faster loans and banks lend with confidence.
            <strong style={{ color: "#cbd5e1" }}> No documents. No branch visits.</strong>
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/owner/login")} style={{
              background: "linear-gradient(135deg, #3b82f6, #06b6d4)", border: "none", color: "#fff",
              padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 8px 30px #3b82f644",
            }}>🏭 Get My Business Score →</button>
            <button onClick={() => navigate("/manager/login")} style={{
              background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0",
              padding: "14px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}>🏦 I'm a Bank Officer</button>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{
          maxWidth: 760, margin: "56px auto 0", display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
          background: "#111a2e", border: "1px solid #1e293b", borderRadius: 16, overflow: "hidden", position: "relative", zIndex: 1,
        }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ padding: "22px 16px", textAlign: "center", borderRight: i < STATS.length - 1 ? "1px solid #1e293b" : "none" }}>
              <div style={{ fontSize: 26, fontWeight: 900, color: "#f1f5f9" }}>{s.value}</div>
              <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── What is it ─────────────────────────────────────────── */}
      <section style={{ padding: "56px 24px", borderTop: "1px solid #111a2e" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: accent, fontWeight: 700, marginBottom: 14 }}>WHAT IS FINHEALTH AI?</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: "#f1f5f9", lineHeight: 1.3, marginBottom: 18 }}>
            43 million Indian MSMEs are "credit invisible". We fix that.
          </h2>
          <p style={{ fontSize: 16, color: "#94a3b8", lineHeight: 1.75 }}>
            Most small businesses can't get a loan because they lack formal balance sheets or a CIBIL history.
            FinHealth AI reads the <strong style={{ color: "#cbd5e1" }}>alternate data they already generate</strong> —
            GST returns, UPI transactions, EPFO payroll — and produces a bank-grade credit assessment with a clear,
            explainable reason for every score. Built for the <strong style={{ color: "#cbd5e1" }}>RBI Account Aggregator</strong> framework,
            it serves both the business owner and the lending officer.
          </p>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────────── */}
      <section id="features" style={{ padding: "56px 24px", background: "#0b1120", borderTop: "1px solid #111a2e" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ fontSize: 12, letterSpacing: 2, color: accent, fontWeight: 700, marginBottom: 12 }}>WHAT IT CAN DO</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#f1f5f9" }}>Everything you need to assess credit, fast</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: "#111a2e", border: "1px solid #1e293b", borderRadius: 18, padding: 26,
                transition: "all 0.25s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#3b82f655"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12, marginBottom: 16, fontSize: 24,
                  background: "#3b82f615", border: "1px solid #3b82f622",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ───────────────────────────────────────── */}
      <section id="how" style={{ padding: "56px 24px", borderTop: "1px solid #111a2e" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 44 }}>
            <div style={{ fontSize: 12, letterSpacing: 2, color: accent, fontWeight: 700, marginBottom: 12 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#f1f5f9" }}>From GSTIN to decision in four steps</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 20 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{ background: "#111a2e", border: "1px solid #1e293b", borderRadius: 18, padding: 24, position: "relative" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", marginBottom: 16,
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800,
                }}>{s.n}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
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
      <section id="audience" style={{ padding: "56px 24px", background: "#0b1120", borderTop: "1px solid #111a2e" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 12, letterSpacing: 2, color: accent, fontWeight: 700, marginBottom: 12 }}>WHO IT'S FOR</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: "#f1f5f9" }}>Two portals, one platform</h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>
            {/* Business Owner */}
            <div onClick={() => navigate("/owner/login")} style={{
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
            </div>

            {/* Bank Manager */}
            <div onClick={() => navigate("/manager/login")} style={{
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
            </div>
          </div>
        </div>
      </section>

      {/* ─── Security / trust ───────────────────────────────────── */}
      <section id="security" style={{ padding: "56px 24px", borderTop: "1px solid #111a2e" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
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
        </div>
      </section>

      {/* ─── CTA band ───────────────────────────────────────────── */}
      <section style={{ padding: "24px 24px 64px" }}>
        <div style={{
          maxWidth: 1000, margin: "0 auto", textAlign: "center",
          background: "linear-gradient(135deg, #1e293b, #1a1240)", border: "1px solid #3b82f633",
          borderRadius: 24, padding: "48px 32px",
        }}>
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
        </div>
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
