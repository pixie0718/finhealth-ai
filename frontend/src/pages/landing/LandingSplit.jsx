import React from "react";
import { useNavigate } from "react-router-dom";
import useIsMobile from "../../hooks/useIsMobile";
import Reveal from "../../components/Reveal";
import { LandingHeader, LandingFooter, ProductCard, StatsRow } from "./pieces";
import { STEPS } from "./data";

const tile = { background: "#0f1a30", border: "1px solid #1e293b", borderRadius: 18, padding: 22, transition: "all 0.25s" };
const hoverIn = (e) => { e.currentTarget.style.borderColor = "#6366f166"; e.currentTarget.style.transform = "translateY(-4px)"; };
const hoverOut = (e) => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.transform = "translateY(0)"; };

export default function LandingSplit() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div style={{ background: "#080c18", color: "#e2e8f0", minHeight: "100vh" }}>
      <LandingHeader navigate={navigate} />

      {/* HERO — split */}
      <section id="top" style={{ position: "relative", overflow: "hidden", padding: isMobile ? "36px 20px 44px" : "72px 28px 64px" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-5%", width: 560, height: 560, background: "radial-gradient(circle, #3b82f628 0%, transparent 70%)", borderRadius: "50%", animation: "fhDrift1 15s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "0%", right: "-8%", width: 520, height: 520, background: "radial-gradient(circle, #8b5cf628 0%, transparent 70%)", borderRadius: "50%", animation: "fhDrift2 18s ease-in-out infinite", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1240, margin: "0 auto", position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr", gap: isMobile ? 34 : 56, alignItems: "center" }}>
          <div style={{ textAlign: isMobile ? "center" : "left", animation: "fhFadeUp 0.6s ease-out both" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1e293b88", border: "1px solid #6366f144", padding: "6px 16px", borderRadius: 20, marginBottom: 24 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
              <span style={{ fontSize: 11.5, color: "#94a3b8" }}>Powered by RBI Account Aggregator · IDBI Innovate 2026</span>
            </div>
            <h1 style={{ fontSize: isMobile ? 40 : 64, fontWeight: 900, color: "#f8fafc", letterSpacing: -2.5, lineHeight: 1.02, marginBottom: 22 }}>
              Loan-ready in <span style={{ background: "linear-gradient(110deg, #3b82f6, #8b5cf6, #06b6d4, #8b5cf6, #3b82f6)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "fhShimmer 4s linear infinite" }}>30 seconds.</span><br />Not 30 days.
            </h1>
            <p style={{ fontSize: isMobile ? 16 : 19, color: "#94a3b8", maxWidth: 500, margin: isMobile ? "0 auto 30px" : "0 0 32px", lineHeight: 1.6 }}>
              FinHealth AI turns a business's GST, UPI &amp; bank data into an instant, explainable credit score. <strong style={{ color: "#e2e8f0" }}>No documents. No branch visits.</strong>
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-start" }}>
              <button onClick={() => navigate("/owner/login")} style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", border: "none", color: "#fff", padding: "15px 28px", borderRadius: 12, fontSize: 15.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 12px 36px #3b82f655" }}>Get My Business Score →</button>
              <button onClick={() => navigate("/manager/login")} style={{ background: "#1e293baa", border: "1px solid #334155", color: "#e2e8f0", padding: "15px 28px", borderRadius: 12, fontSize: 15.5, fontWeight: 700, cursor: "pointer" }}>🏦 I'm a Bank Officer</button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 28, justifyContent: isMobile ? "center" : "flex-start" }}>
              {["📊 GST", "📱 UPI", "🏦 Bank (AA)", "👥 EPFO", "💳 CIBIL"].map((t) => (
                <span key={t} style={{ fontSize: 11.5, color: "#94a3b8", background: "#0f1a30", border: "1px solid #1e293b", padding: "5px 12px", borderRadius: 20 }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ animation: "fhFadeUp 0.7s 0.15s ease-out both", maxWidth: 400, width: "100%", margin: "0 auto" }}>
            <ProductCard navigate={navigate} />
          </div>
        </div>
      </section>

      {/* BENTO features */}
      <section id="features" style={{ padding: isMobile ? "40px 20px" : "64px 28px", borderTop: "1px solid #111a2e" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 12, letterSpacing: 2, color: "#818cf8", fontWeight: 700, marginBottom: 12 }}>WHAT IT CAN DO</div>
            <h2 style={{ fontSize: isMobile ? 28 : 38, fontWeight: 800, color: "#f1f5f9", letterSpacing: -1 }}>Everything you need to assess credit</h2>
          </Reveal>

          <div style={{
            display: "grid", gap: 16,
            gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
            gridTemplateAreas: isMobile ? "none" : `"score score chat chat" "score score stat ntc" "pillar pillar shap shap"`,
          }}>
            {/* Instant score — big */}
            <Reveal style={{ gridArea: isMobile ? "auto" : "score" }}>
              <div style={{ ...tile, height: "100%", padding: 28, background: "linear-gradient(160deg, #12213f, #0c1424)" }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                <div style={{ fontSize: 30, marginBottom: 14 }}>⚡</div>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 10 }}>Instant Score from GSTIN</h3>
                <p style={{ fontSize: 14.5, color: "#94a3b8", lineHeight: 1.65, marginBottom: 20 }}>Type a GST number and get a 0–100 financial health score in seconds — no balance sheets, no paperwork, no branch visit.</p>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "#0b1220", border: "1px solid #1e293b", borderRadius: 14, padding: "12px 18px" }}>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#4ade80" }}>84</div>
                  <div><div style={{ fontSize: 12, color: "#4ade80", fontWeight: 700 }}>Grade A</div><div style={{ fontSize: 11, color: "#64748b" }}>₹18.5L eligible</div></div>
                </div>
              </div>
            </Reveal>
            {/* AI chat */}
            <Reveal delay={0.05} style={{ gridArea: isMobile ? "auto" : "chat" }}>
              <div style={{ ...tile, height: "100%" }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>🤖</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>Built-in AI Assistant</h3>
                <div style={{ background: "#0b1220", border: "1px solid #1e293b", borderRadius: 12, padding: 12, fontSize: 12.5 }}>
                  <div style={{ color: "#93c5fd", marginBottom: 8 }}>"How can I improve my cash flow score?"</div>
                  <div style={{ color: "#94a3b8", lineHeight: 1.5 }}>✦ Route UPI collections through your primary account and clear overdue payments…</div>
                </div>
              </div>
            </Reveal>
            {/* Stat */}
            <Reveal delay={0.1} style={{ gridArea: isMobile ? "auto" : "stat" }}>
              <div style={{ ...tile, height: "100%", textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                <div style={{ fontSize: 34, fontWeight: 900, background: "linear-gradient(135deg, #93c5fd, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>98.2%</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>ML Accuracy</div>
              </div>
            </Reveal>
            {/* NTC */}
            <Reveal delay={0.12} style={{ gridArea: isMobile ? "auto" : "ntc" }}>
              <div style={{ ...tile, height: "100%" }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>🌱</div>
                <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>New-to-Credit Fair</h3>
                <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>No CIBIL? Scored on GST &amp; cash-flow instead.</p>
              </div>
            </Reveal>
            {/* Pillars */}
            <Reveal delay={0.05} style={{ gridArea: isMobile ? "auto" : "pillar" }}>
              <div style={{ ...tile, height: "100%" }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>🧩</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>5-Pillar Breakdown</h3>
                {[["Cash Flow", 82, "#3b82f6"], ["Compliance", 91, "#8b5cf6"], ["Growth", 76, "#06b6d4"]].map(([l, v, c]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                    <div style={{ width: 78, fontSize: 11.5, color: "#94a3b8" }}>{l}</div>
                    <div style={{ flex: 1, height: 6, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}><div style={{ width: `${v}%`, height: "100%", background: c, borderRadius: 4 }} /></div>
                  </div>
                ))}
              </div>
            </Reveal>
            {/* SHAP */}
            <Reveal delay={0.1} style={{ gridArea: isMobile ? "auto" : "shap" }}>
              <div style={{ ...tile, height: "100%" }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>🔍</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>Explainable AI (SHAP)</h3>
                <p style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.6 }}>Not a black box. Every decision shows the top factors pushing the score up or down — plus MUDRA / CGTMSE loan matches.</p>
              </div>
            </Reveal>
          </div>

          <div style={{ marginTop: 24 }}><StatsRow isMobile={isMobile} /></div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <HowSection isMobile={isMobile} />
      {/* AUDIENCE + CTA */}
      <AudienceCta navigate={navigate} isMobile={isMobile} />
      <LandingFooter navigate={navigate} />
    </div>
  );
}

// shared-ish sections used by this variant
function HowSection({ isMobile }) {
  return (
    <section id="how" style={{ padding: isMobile ? "40px 20px" : "64px 28px", background: "#0b1120", borderTop: "1px solid #111a2e" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: "#818cf8", fontWeight: 700, marginBottom: 12 }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: isMobile ? 28 : 38, fontWeight: 800, color: "#f1f5f9", letterSpacing: -1 }}>From GSTIN to decision in 4 steps</h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: 16 }}>
          {STEPS.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{ ...tile, height: "100%" }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", marginBottom: 16, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, boxShadow: "0 6px 20px #3b82f655" }}>{s.n}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function AudienceCta({ navigate, isMobile }) {
  return (
    <section id="audience" style={{ padding: isMobile ? "40px 20px" : "64px 28px" }}>
      <div style={{ maxWidth: 1060, margin: "0 auto" }}>
        <Reveal style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: "#818cf8", fontWeight: 700, marginBottom: 12 }}>WHO IT'S FOR</div>
          <h2 style={{ fontSize: isMobile ? 28 : 38, fontWeight: 800, color: "#f1f5f9", letterSpacing: -1 }}>Two portals, one platform</h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18 }}>
          <Reveal><div onClick={() => navigate("/owner/login")} style={{ height: "100%", boxSizing: "border-box", background: "linear-gradient(135deg, #1e293b, #0f1f3d)", border: "1px solid #1e3a5f", borderRadius: 22, padding: 30, cursor: "pointer" }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
            <div style={{ fontSize: 30, marginBottom: 14 }}>🏭</div>
            <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>BUSINESS OWNER</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", marginBottom: 10 }}>Check Loan Eligibility</h3>
            <p style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.7, marginBottom: 16 }}>Get your Financial Health Score, see how much you can borrow, and learn exactly what to improve.</p>
            <div style={{ fontSize: 13, color: "#3b82f6", fontWeight: 700 }}>Get My Score →</div>
          </div></Reveal>
          <Reveal delay={0.1}><div onClick={() => navigate("/manager/login")} style={{ height: "100%", boxSizing: "border-box", background: "linear-gradient(135deg, #1e293b, #1a0f3d)", border: "1px solid #2d1f5e", borderRadius: 22, padding: 30, cursor: "pointer" }} onMouseEnter={hoverIn} onMouseLeave={hoverOut}>
            <div style={{ fontSize: 30, marginBottom: 14 }}>🏦</div>
            <div style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>BANK MANAGER</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", marginBottom: 10 }}>Review Applications</h3>
            <p style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.7, marginBottom: 16 }}>AI-scored, SHAP-explained credit reports with a portfolio dashboard and loan-outcome tracking.</p>
            <div style={{ fontSize: 13, color: "#8b5cf6", fontWeight: 700 }}>Open Console →</div>
          </div></Reveal>
        </div>
      </div>
    </section>
  );
}
