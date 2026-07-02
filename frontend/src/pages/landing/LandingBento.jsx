import React from "react";
import { useNavigate } from "react-router-dom";
import useIsMobile from "../../hooks/useIsMobile";
import Reveal from "../../components/Reveal";
import CountUp from "../../components/CountUp";
import { LandingHeader, LandingFooter, ScoreRing } from "./pieces";
import { STEPS } from "./data";

const tile = { background: "#0f1a30", border: "1px solid #1e293b", borderRadius: 20, padding: 22, transition: "all 0.25s", height: "100%", boxSizing: "border-box" };
const hIn = (e) => { e.currentTarget.style.borderColor = "#6366f166"; e.currentTarget.style.transform = "translateY(-3px)"; };
const hOut = (e) => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.transform = "translateY(0)"; };

export default function LandingBento() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div style={{ background: "#080c18", color: "#e2e8f0", minHeight: "100vh" }}>
      <LandingHeader navigate={navigate} />

      {/* Compact hero */}
      <section id="top" style={{ position: "relative", overflow: "hidden", padding: isMobile ? "40px 20px 24px" : "64px 28px 28px", textAlign: "center" }}>
        <div style={{ position: "absolute", top: "-20%", left: "50%", width: 700, height: 460, transform: "translateX(-50%)", background: "radial-gradient(circle, #6366f130 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
        <div style={{ maxWidth: 800, margin: "0 auto", position: "relative", zIndex: 1, animation: "fhFadeUp 0.6s ease-out both" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1e293b88", border: "1px solid #6366f144", padding: "6px 16px", borderRadius: 20, marginBottom: 22 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
            <span style={{ fontSize: 11.5, color: "#94a3b8" }}>Powered by RBI Account Aggregator · IDBI Innovate 2026</span>
          </div>
          <h1 style={{ fontSize: isMobile ? 38 : 60, fontWeight: 900, color: "#f8fafc", letterSpacing: -2.5, lineHeight: 1.03, marginBottom: 18 }}>
            Loan-ready in <span style={{ background: "linear-gradient(110deg, #3b82f6, #8b5cf6, #06b6d4, #8b5cf6, #3b82f6)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "fhShimmer 4s linear infinite" }}>30 seconds.</span>
          </h1>
          <p style={{ fontSize: isMobile ? 15.5 : 18, color: "#94a3b8", maxWidth: 560, margin: "0 auto 26px", lineHeight: 1.6 }}>
            Instant, explainable MSME credit scores from GST, UPI &amp; bank data — no documents, no branch visits.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => navigate("/owner/login")} style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", border: "none", color: "#fff", padding: "14px 28px", borderRadius: 12, fontSize: 15.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 12px 36px #3b82f655" }}>Get My Business Score →</button>
            <button onClick={() => navigate("/manager/login")} style={{ background: "#1e293baa", border: "1px solid #334155", color: "#e2e8f0", padding: "14px 28px", borderRadius: 12, fontSize: 15.5, fontWeight: 700, cursor: "pointer" }}>🏦 I'm a Bank Officer</button>
          </div>
        </div>
      </section>

      {/* THE BENTO GRID */}
      <section id="features" style={{ padding: isMobile ? "12px 20px 44px" : "20px 28px 64px" }}>
        <div style={{
          maxWidth: 1200, margin: "0 auto", display: "grid", gap: 16,
          gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
          gridAutoRows: isMobile ? "auto" : "minmax(150px, auto)",
          gridTemplateAreas: isMobile ? "none" : `"score score stat chat" "score score pillar chat" "ntc loan pillar shap"`,
        }}>
          {/* SCORE — big */}
          <Reveal style={{ gridArea: isMobile ? "auto" : "score" }}>
            <div style={{ ...tile, background: "linear-gradient(160deg, #12213f, #0c1424)", padding: 26 }} onMouseEnter={hIn} onMouseLeave={hOut}>
              <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1.2, fontWeight: 700, marginBottom: 14 }}>INSTANT FINANCIAL HEALTH SCORE</div>
              <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
                <ScoreRing target={84} size={120} />
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#4ade80" }}>Grade A · Excellent</div>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 6 }}>Eligible loan amount</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#f1f5f9" }}>₹18.5L</div>
                  <div style={{ display: "inline-block", marginTop: 8, fontSize: 11, fontWeight: 800, color: "#4ade80", background: "#15803d22", border: "1px solid #15803d55", padding: "3px 12px", borderRadius: 20 }}>✓ APPROVED · LOW RISK</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 16, lineHeight: 1.5 }}>Type a GSTIN → score in seconds. No balance sheets, no paperwork.</p>
            </div>
          </Reveal>

          {/* STAT */}
          <Reveal delay={0.05} style={{ gridArea: isMobile ? "auto" : "stat" }}>
            <div style={{ ...tile, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }} onMouseEnter={hIn} onMouseLeave={hOut}>
              <CountUp end={98.2} decimals={1} suffix="%" style={{ fontSize: 38, fontWeight: 900, background: "linear-gradient(135deg, #93c5fd, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }} />
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>ML Accuracy</div>
            </div>
          </Reveal>

          {/* CHAT — tall */}
          <Reveal delay={0.1} style={{ gridArea: isMobile ? "auto" : "chat" }}>
            <div style={{ ...tile }} onMouseEnter={hIn} onMouseLeave={hOut}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>🤖</div>
              <h3 style={{ fontSize: 15.5, fontWeight: 700, color: "#f1f5f9", marginBottom: 12 }}>AI Assistant</h3>
              <div style={{ background: "#0b1220", border: "1px solid #1e293b", borderRadius: 10, padding: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 11.5, color: "#93c5fd" }}>"How do I improve my score?"</div>
              </div>
              <div style={{ background: "#111a2e", border: "1px solid #1e293b", borderRadius: 10, padding: 10, fontSize: 11.5, color: "#94a3b8", lineHeight: 1.5 }}>✦ File GST on time, clear overdue payments &amp; route UPI through your main account.</div>
            </div>
          </Reveal>

          {/* PILLARS — tall */}
          <Reveal delay={0.08} style={{ gridArea: isMobile ? "auto" : "pillar" }}>
            <div style={{ ...tile }} onMouseEnter={hIn} onMouseLeave={hOut}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>🧩</div>
              <h3 style={{ fontSize: 15.5, fontWeight: 700, color: "#f1f5f9", marginBottom: 14 }}>5-Pillar Breakdown</h3>
              {[["Cash Flow", 82, "#3b82f6"], ["Compliance", 91, "#8b5cf6"], ["Growth", 76, "#06b6d4"], ["Stability", 84, "#f59e0b"], ["Credit", 78, "#ec4899"]].map(([l, v, c]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 72, fontSize: 11.5, color: "#94a3b8" }}>{l}</div>
                  <div style={{ flex: 1, height: 6, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}><div style={{ width: `${v}%`, height: "100%", background: c, borderRadius: 4 }} /></div>
                  <div style={{ width: 20, fontSize: 11, fontWeight: 700, color: "#cbd5e1" }}>{v}</div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* NTC */}
          <Reveal delay={0.05} style={{ gridArea: isMobile ? "auto" : "ntc" }}>
            <div style={{ ...tile }} onMouseEnter={hIn} onMouseLeave={hOut}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>🌱</div>
              <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>New-to-Credit Fairness</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>No CIBIL? Scored on GST &amp; cash-flow instead of rejected.</p>
            </div>
          </Reveal>

          {/* LOAN */}
          <Reveal delay={0.1} style={{ gridArea: isMobile ? "auto" : "loan" }}>
            <div style={{ ...tile }} onMouseEnter={hIn} onMouseLeave={hOut}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>💰</div>
              <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>11 Loan Products</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>MUDRA · CGTMSE · Stand-Up India &amp; more, auto-matched.</p>
            </div>
          </Reveal>

          {/* SHAP */}
          <Reveal delay={0.12} style={{ gridArea: isMobile ? "auto" : "shap" }}>
            <div style={{ ...tile }} onMouseEnter={hIn} onMouseLeave={hOut}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>🔍</div>
              <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>Explainable AI</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>SHAP shows why — not a black box.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* How it works — horizontal strip */}
      <section id="how" style={{ padding: isMobile ? "40px 20px" : "56px 28px", background: "#0b1120", borderTop: "1px solid #111a2e" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 12, letterSpacing: 2, color: "#818cf8", fontWeight: 700, marginBottom: 12 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize: isMobile ? 26 : 34, fontWeight: 800, color: "#f1f5f9", letterSpacing: -1 }}>From GSTIN to decision in 4 steps</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: 16 }}>
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 0.09}>
                <div style={{ ...tile }} onMouseEnter={hIn} onMouseLeave={hOut}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", marginBottom: 14, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800 }}>{s.n}</div>
                  <h3 style={{ fontSize: 15.5, fontWeight: 700, color: "#f1f5f9", marginBottom: 7 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.55 }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Audience */}
      <section id="audience" style={{ padding: isMobile ? "44px 20px" : "60px 28px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 34 }}>
            <div style={{ fontSize: 12, letterSpacing: 2, color: "#818cf8", fontWeight: 700, marginBottom: 12 }}>WHO IT'S FOR</div>
            <h2 style={{ fontSize: isMobile ? 26 : 34, fontWeight: 800, color: "#f1f5f9", letterSpacing: -1 }}>Two portals, one platform</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18 }}>
            <Reveal><div onClick={() => navigate("/owner/login")} style={{ height: "100%", boxSizing: "border-box", background: "linear-gradient(135deg, #1e293b, #0f1f3d)", border: "1px solid #1e3a5f", borderRadius: 22, padding: 30, cursor: "pointer" }} onMouseEnter={hIn} onMouseLeave={hOut}>
              <div style={{ fontSize: 30, marginBottom: 14 }}>🏭</div>
              <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>BUSINESS OWNER</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", marginBottom: 10 }}>Check Loan Eligibility</h3>
              <p style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.7, marginBottom: 16 }}>Get your score, see how much you can borrow, and learn exactly what to improve.</p>
              <div style={{ fontSize: 13, color: "#3b82f6", fontWeight: 700 }}>Get My Score →</div>
            </div></Reveal>
            <Reveal delay={0.1}><div onClick={() => navigate("/manager/login")} style={{ height: "100%", boxSizing: "border-box", background: "linear-gradient(135deg, #1e293b, #1a0f3d)", border: "1px solid #2d1f5e", borderRadius: 22, padding: 30, cursor: "pointer" }} onMouseEnter={hIn} onMouseLeave={hOut}>
              <div style={{ fontSize: 30, marginBottom: 14 }}>🏦</div>
              <div style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>BANK MANAGER</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", marginBottom: 10 }}>Review Applications</h3>
              <p style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.7, marginBottom: 16 }}>AI-scored, SHAP-explained credit reports with a portfolio dashboard.</p>
              <div style={{ fontSize: 13, color: "#8b5cf6", fontWeight: 700 }}>Open Console →</div>
            </div></Reveal>
          </div>
        </div>
      </section>

      <LandingFooter navigate={navigate} />
    </div>
  );
}
