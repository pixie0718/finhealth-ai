import React from "react";
import { useNavigate } from "react-router-dom";
import useIsMobile from "../../hooks/useIsMobile";
import Reveal from "../../components/Reveal";
import { LandingHeader, LandingFooter, StatsRow, ScoreRing } from "./pieces";
import { STEPS } from "./data";

const ZIG = [
  { icon: "⚡", tag: "INSTANT", title: "A score in 30 seconds", desc: "Type a GSTIN, give consent, and get a 0–100 financial health score instantly — no balance sheets, no documents, no branch visits.",
    visual: (<div style={{ display: "flex", alignItems: "center", gap: 16 }}><ScoreRing target={84} size={110} /><div><div style={{ fontSize: 15, fontWeight: 800, color: "#4ade80" }}>Grade A · Excellent</div><div style={{ fontSize: 22, fontWeight: 900, color: "#f1f5f9" }}>₹18.5L</div><div style={{ fontSize: 11, color: "#64748b" }}>eligible loan amount</div></div></div>) },
  { icon: "🧩", tag: "TRANSPARENT", title: "See exactly what drives it", desc: "Every score splits into 5 pillars — Cash Flow, Compliance, Growth, Stability, Credit — with SHAP explaining the top factors in plain language.",
    visual: (<div>{[["Cash Flow", 82, "#3b82f6"], ["Compliance", 91, "#8b5cf6"], ["Growth", 76, "#06b6d4"], ["Stability", 84, "#f59e0b"]].map(([l, v, c]) => (<div key={l} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}><div style={{ width: 84, fontSize: 12.5, color: "#94a3b8" }}>{l}</div><div style={{ flex: 1, height: 8, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}><div style={{ width: `${v}%`, height: "100%", background: c, borderRadius: 4 }} /></div><div style={{ width: 24, fontSize: 12, fontWeight: 700, color: "#cbd5e1" }}>{v}</div></div>))}</div>) },
  { icon: "🌱", tag: "INCLUSIVE", title: "Credit for the credit-invisible", desc: "No CIBIL history? We re-weight the score around GST & cash-flow instead of rejecting you — and match MUDRA, CGTMSE & Stand-Up India schemes.",
    visual: (<div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>{["MUDRA Shishu", "MUDRA Kishore", "CGTMSE-backed", "Stand-Up India"].map((t) => (<span key={t} style={{ fontSize: 12.5, color: "#86efac", background: "#15803d18", border: "1px solid #15803d44", padding: "8px 14px", borderRadius: 20 }}>✓ {t}</span>))}</div>) },
];

export default function LandingSpotlight() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div style={{ background: "#080c18", color: "#e2e8f0", minHeight: "100vh" }}>
      <LandingHeader navigate={navigate} />

      {/* HERO — centered spotlight */}
      <section id="top" style={{ position: "relative", overflow: "hidden", padding: isMobile ? "40px 20px 40px" : "72px 28px 56px", textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(#ffffff08 1px, transparent 1px), linear-gradient(90deg, #ffffff08 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse 70% 55% at 50% 0%, #000 30%, transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 0%, #000 30%, transparent 100%)" }} />
        <div style={{ position: "absolute", top: "-15%", left: "50%", width: 700, height: 500, transform: "translateX(-50%)", background: "radial-gradient(circle, #6366f130 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        <div style={{ maxWidth: 820, margin: "0 auto", position: "relative", zIndex: 1, animation: "fhFadeUp 0.6s ease-out both" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#1e293b88", border: "1px solid #6366f144", padding: "6px 16px", borderRadius: 20, marginBottom: 24 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
            <span style={{ fontSize: 11.5, color: "#94a3b8" }}>Powered by RBI Account Aggregator · IDBI Innovate 2026</span>
          </div>
          <h1 style={{ fontSize: isMobile ? 40 : 66, fontWeight: 900, color: "#f8fafc", letterSpacing: -2.5, lineHeight: 1.03, marginBottom: 22 }}>
            Loan-ready in <span style={{ background: "linear-gradient(110deg, #3b82f6, #8b5cf6, #06b6d4, #8b5cf6, #3b82f6)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "fhShimmer 4s linear infinite" }}>30 seconds.</span> Not 30 days.
          </h1>
          <p style={{ fontSize: isMobile ? 16 : 19, color: "#94a3b8", maxWidth: 600, margin: "0 auto 30px", lineHeight: 1.6 }}>
            FinHealth AI turns a business's GST, UPI &amp; bank data into an instant, explainable credit score — so India's MSMEs get faster loans and banks lend with confidence.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={() => navigate("/owner/login")} style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", border: "none", color: "#fff", padding: "15px 30px", borderRadius: 12, fontSize: 15.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 12px 36px #3b82f655" }}>Get My Business Score →</button>
            <button onClick={() => navigate("/manager/login")} style={{ background: "#1e293baa", border: "1px solid #334155", color: "#e2e8f0", padding: "15px 30px", borderRadius: 12, fontSize: 15.5, fontWeight: 700, cursor: "pointer" }}>🏦 I'm a Bank Officer</button>
          </div>
        </div>

        {/* Big browser-frame dashboard mock */}
        <Reveal style={{ maxWidth: 1080, margin: "48px auto 0", position: "relative", zIndex: 1 }}>
          <div style={{ background: "#0d1526", border: "1px solid #2a3a5f", borderRadius: 16, overflow: "hidden", boxShadow: "0 40px 90px #000000aa" }}>
            <div style={{ height: 40, background: "#0b1220", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
              {["#ef4444", "#f59e0b", "#22c55e"].map((c) => <span key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}
              <div style={{ marginLeft: 12, flex: 1, maxWidth: 320, height: 22, background: "#111a2e", borderRadius: 6, display: "flex", alignItems: "center", padding: "0 12px", fontSize: 11, color: "#475569" }}>🔒 finhealth.ai/dashboard</div>
            </div>
            <div style={{ padding: isMobile ? 16 : 24, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "0.9fr 1.1fr 0.9fr", gap: 16, textAlign: "left" }}>
              {/* score */}
              <div style={{ background: "#101c34", border: "1px solid #1e293b", borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1, alignSelf: "flex-start" }}>HEALTH SCORE</div>
                <ScoreRing target={84} size={104} />
                <div style={{ fontSize: 12, fontWeight: 800, color: "#4ade80" }}>Grade A · LOW RISK</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#f1f5f9" }}>₹18.5L eligible</div>
              </div>
              {/* pillars */}
              <div style={{ background: "#101c34", border: "1px solid #1e293b", borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1, marginBottom: 14 }}>5-PILLAR BREAKDOWN</div>
                {[["Cash Flow", 82, "#3b82f6"], ["Compliance", 91, "#8b5cf6"], ["Growth", 76, "#06b6d4"], ["Stability", 84, "#f59e0b"], ["Credit", 78, "#ec4899"]].map(([l, v, c]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                    <div style={{ width: 72, fontSize: 11, color: "#94a3b8" }}>{l}</div>
                    <div style={{ flex: 1, height: 6, background: "#1e293b", borderRadius: 4, overflow: "hidden" }}><div style={{ width: `${v}%`, height: "100%", background: c, borderRadius: 4 }} /></div>
                    <div style={{ width: 20, fontSize: 11, fontWeight: 700, color: "#cbd5e1" }}>{v}</div>
                  </div>
                ))}
              </div>
              {/* chat + status */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "#101c34", border: "1px solid #1e293b", borderRadius: 14, padding: 16 }}>
                  <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1, marginBottom: 10 }}>🤖 AI ASSISTANT</div>
                  <div style={{ fontSize: 11.5, color: "#93c5fd", marginBottom: 6 }}>"Why is my score 84?"</div>
                  <div style={{ fontSize: 11.5, color: "#94a3b8", lineHeight: 1.5 }}>✦ Strong GST compliance (91) & steady cash flow drive it up…</div>
                </div>
                <div style={{ background: "#0d2618", border: "1px solid #15803d44", borderRadius: 14, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#4ade80" }}>✓ APPROVED</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>MSME Loan · 10.5% p.a.</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <div style={{ maxWidth: 900, margin: "40px auto 0", position: "relative", zIndex: 1 }}><StatsRow isMobile={isMobile} /></div>
      </section>

      {/* Zig-zag features */}
      <section id="features" style={{ padding: isMobile ? "44px 20px" : "72px 28px", borderTop: "1px solid #111a2e" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 12, letterSpacing: 2, color: "#818cf8", fontWeight: 700, marginBottom: 12 }}>WHAT IT CAN DO</div>
            <h2 style={{ fontSize: isMobile ? 28 : 38, fontWeight: 800, color: "#f1f5f9", letterSpacing: -1 }}>Built for speed, fairness &amp; trust</h2>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 40 : 64 }}>
            {ZIG.map((z, i) => (
              <Reveal key={i}>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 20 : 48, alignItems: "center", direction: !isMobile && i % 2 === 1 ? "rtl" : "ltr" }}>
                  <div style={{ direction: "ltr", background: "#0f1a30", border: "1px solid #1e293b", borderRadius: 18, padding: 26 }}>{z.visual}</div>
                  <div style={{ direction: "ltr" }}>
                    <div style={{ display: "inline-block", fontSize: 10.5, letterSpacing: 1.5, color: "#818cf8", fontWeight: 700, background: "#6366f118", border: "1px solid #6366f133", padding: "3px 10px", borderRadius: 20, marginBottom: 14 }}>{z.icon} {z.tag}</div>
                    <h3 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, color: "#f1f5f9", marginBottom: 12, letterSpacing: -0.5 }}>{z.title}</h3>
                    <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7 }}>{z.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" style={{ padding: isMobile ? "44px 20px" : "64px 28px", background: "#0b1120", borderTop: "1px solid #111a2e" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{ fontSize: 12, letterSpacing: 2, color: "#818cf8", fontWeight: 700, marginBottom: 12 }}>HOW IT WORKS</div>
            <h2 style={{ fontSize: isMobile ? 28 : 38, fontWeight: 800, color: "#f1f5f9", letterSpacing: -1 }}>From GSTIN to decision in 4 steps</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: 16 }}>
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={{ background: "#0f1a30", border: "1px solid #1e293b", borderRadius: 18, padding: 24, height: "100%" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", marginBottom: 16, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800 }}>{s.n}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.6 }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Audience */}
      <section id="audience" style={{ padding: isMobile ? "44px 20px" : "64px 28px" }}>
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ fontSize: 12, letterSpacing: 2, color: "#818cf8", fontWeight: 700, marginBottom: 12 }}>WHO IT'S FOR</div>
            <h2 style={{ fontSize: isMobile ? 28 : 38, fontWeight: 800, color: "#f1f5f9", letterSpacing: -1 }}>Two portals, one platform</h2>
          </Reveal>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18 }}>
            <Reveal><div onClick={() => navigate("/owner/login")} style={{ height: "100%", boxSizing: "border-box", background: "linear-gradient(135deg, #1e293b, #0f1f3d)", border: "1px solid #1e3a5f", borderRadius: 22, padding: 30, cursor: "pointer" }}>
              <div style={{ fontSize: 30, marginBottom: 14 }}>🏭</div>
              <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>BUSINESS OWNER</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", marginBottom: 10 }}>Check Loan Eligibility</h3>
              <p style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.7, marginBottom: 16 }}>Get your Financial Health Score, see how much you can borrow, and learn exactly what to improve.</p>
              <div style={{ fontSize: 13, color: "#3b82f6", fontWeight: 700 }}>Get My Score →</div>
            </div></Reveal>
            <Reveal delay={0.1}><div onClick={() => navigate("/manager/login")} style={{ height: "100%", boxSizing: "border-box", background: "linear-gradient(135deg, #1e293b, #1a0f3d)", border: "1px solid #2d1f5e", borderRadius: 22, padding: 30, cursor: "pointer" }}>
              <div style={{ fontSize: 30, marginBottom: 14 }}>🏦</div>
              <div style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>BANK MANAGER</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", marginBottom: 10 }}>Review Applications</h3>
              <p style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.7, marginBottom: 16 }}>AI-scored, SHAP-explained credit reports with a portfolio dashboard and loan-outcome tracking.</p>
              <div style={{ fontSize: 13, color: "#8b5cf6", fontWeight: 700 }}>Open Console →</div>
            </div></Reveal>
          </div>
        </div>
      </section>

      <LandingFooter navigate={navigate} />
    </div>
  );
}
