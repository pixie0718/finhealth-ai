import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useIsMobile from "../../hooks/useIsMobile";
import Reveal from "../../components/Reveal";
import CountUp from "../../components/CountUp";
import { LandingHeader, LandingFooter, ProductCard, ScoreRing } from "./pieces";
import { STEPS, DATA_SOURCES } from "./data";

const tile = { background: "var(--c-tile)", border: "1px solid var(--c-border-soft)", borderRadius: 20, padding: 22, height: "100%", boxSizing: "border-box" };

const SectionHead = ({ tag, title, sub, isMobile }) => (
  <Reveal style={{ textAlign: "center", marginBottom: 44, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
    <div style={{ fontSize: 12, letterSpacing: 2, color: "#818cf8", fontWeight: 700, marginBottom: 12 }}>{tag}</div>
    <h2 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 800, color: "var(--c-text)", letterSpacing: -1.2, lineHeight: 1.12 }}>{title}</h2>
    {sub && <p style={{ fontSize: 16, color: "#94a3b8", marginTop: 14, lineHeight: 1.6 }}>{sub}</p>}
  </Reveal>
);

const TESTIMONIALS = [
  { quote: "Got my working-capital loan approved in a day — I just entered my GSTIN. No CA, no paperwork.", name: "Rakesh Patel", role: "Textile trader, Surat", avatar: "🧵" },
  { quote: "The SHAP explanation told me exactly why my score was low. Fixed my GST filing and it jumped 12 points.", name: "Ananya Rao", role: "Food processing, Pune", avatar: "🍱" },
  { quote: "As a loan officer, the portfolio dashboard cut my review time in half. Every decision is auditable.", name: "Vikram Nair", role: "Credit Officer, IDBI", avatar: "🏦" },
];

const FAQS = [
  { q: "Do I need any documents to get a score?", a: "No. FinHealth AI reads your GST, UPI/bank and EPFO data through the RBI Account Aggregator framework with your consent — no balance sheets, no uploads, no branch visit." },
  { q: "What if I've never taken a loan before?", a: "That's exactly who we're built for. In New-to-Credit mode we drop the CIBIL pillar and re-weight your score around GST & cash-flow, then match you to MUDRA, CGTMSE and Stand-Up India schemes." },
  { q: "Is my data safe?", a: "Yes. Data is only ever pulled with your explicit, time-bound consent. Every assessment mints a signed consent artifact that is fully auditable and revocable at any time." },
  { q: "How accurate is the score?", a: "The score combines a transparent 5-pillar rule engine with an XGBoost model, and every result is explained with SHAP so you can see the top factors — no black box." },
  { q: "Who can use the platform?", a: "Two roles: business owners check their own loan eligibility, and bank officers review AI-scored applications on a portfolio dashboard with loan-outcome tracking." },
];

const COMPARE = [
  ["Time to a decision", "2–4 weeks", "Under 30 seconds"],
  ["Documents required", "Balance sheets, ITR, bank PDFs", "None — GSTIN + consent"],
  ["New-to-credit businesses", "Usually rejected", "Fairly scored on alt-data"],
  ["Why the decision?", "Opaque", "SHAP-explained, auditable"],
  ["Where", "Branch visits", "100% online"],
];

function Bar({ l, v, c }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
      <div style={{ width: 72, fontSize: 11, color: "#94a3b8" }}>{l}</div>
      <div style={{ flex: 1, height: 6, background: "var(--c-surface)", borderRadius: 4, overflow: "hidden" }}><div style={{ width: `${v}%`, height: "100%", background: c, borderRadius: 4 }} /></div>
      <div style={{ width: 20, fontSize: 11, fontWeight: 700, color: "var(--c-text-2)" }}>{v}</div>
    </div>
  );
}

export default function LandingMega() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div style={{ background: "var(--c-deepest)", color: "var(--c-text-2)", minHeight: "100vh" }}>
      <LandingHeader navigate={navigate} />

      {/* ═══ HERO (split) ═══ */}
      <section id="top" style={{ position: "relative", overflow: "hidden", padding: isMobile ? "36px 20px 40px" : "72px 28px 56px" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "linear-gradient(#ffffff07 1px, transparent 1px), linear-gradient(90deg, #ffffff07 1px, transparent 1px)", backgroundSize: "48px 48px", maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 100%)", WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 100%)" }} />
        <div style={{ position: "absolute", top: "-20%", left: "-5%", width: 560, height: 560, background: "radial-gradient(circle, #3b82f628 0%, transparent 70%)", borderRadius: "50%", animation: "fhDrift1 15s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "0%", right: "-8%", width: 520, height: 520, background: "radial-gradient(circle, #8b5cf628 0%, transparent 70%)", borderRadius: "50%", animation: "fhDrift2 18s ease-in-out infinite", pointerEvents: "none" }} />

        <div style={{ maxWidth: 1240, margin: "0 auto", position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.05fr 0.95fr", gap: isMobile ? 34 : 56, alignItems: "center" }}>
          <div style={{ textAlign: isMobile ? "center" : "left", animation: "fhFadeUp 0.6s ease-out both" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--c-tile2)", border: "1px solid #6366f144", padding: "6px 16px", borderRadius: 20, marginBottom: 24 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e" }} />
              <span style={{ fontSize: 11.5, color: "#94a3b8" }}>Powered by RBI Account Aggregator · IDBI Innovate 2026</span>
            </div>
            <h1 style={{ fontSize: isMobile ? 40 : 64, fontWeight: 900, color: "var(--c-text)", letterSpacing: -2.5, lineHeight: 1.02, marginBottom: 22 }}>
              Loan-ready in <span style={{ background: "linear-gradient(110deg, #3b82f6, #8b5cf6, #06b6d4, #8b5cf6, #3b82f6)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "fhShimmer 4s linear infinite" }}>30 seconds.</span><br />Not 30 days.
            </h1>
            <p style={{ fontSize: isMobile ? 16 : 19, color: "#94a3b8", maxWidth: 500, margin: isMobile ? "0 auto 30px" : "0 0 32px", lineHeight: 1.6 }}>
              FinHealth AI turns a business's GST, UPI &amp; bank data into an instant, explainable credit score. <strong style={{ color: "var(--c-text-2)" }}>No documents. No branch visits.</strong>
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-start" }}>
              <button className="fh-btn fh-btn-primary" onClick={() => navigate("/owner/login")} style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)", border: "none", color: "#fff", padding: "15px 28px", borderRadius: 12, fontSize: 15.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 12px 36px #3b82f655" }}>Get My Business Score <span className="fh-arrow">→</span></button>
              <button className="fh-btn" onClick={() => navigate("/manager/login")} style={{ background: "var(--c-tile2)", border: "1px solid var(--c-border)", color: "var(--c-text-2)", padding: "15px 28px", borderRadius: 12, fontSize: 15.5, fontWeight: 700, cursor: "pointer" }}>🏦 I'm a Bank Officer</button>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 28, justifyContent: isMobile ? "center" : "flex-start" }}>
              {["📊 GST", "📱 UPI", "🏦 Bank (AA)", "👥 EPFO", "💳 CIBIL"].map((t) => (
                <span key={t} style={{ fontSize: 11.5, color: "#94a3b8", background: "var(--c-tile)", border: "1px solid var(--c-border-soft)", padding: "5px 12px", borderRadius: 20 }}>{t}</span>
              ))}
            </div>
          </div>
          <div style={{ animation: "fhFadeUp 0.7s 0.15s ease-out both", maxWidth: 400, width: "100%", margin: "0 auto" }}>
            <ProductCard navigate={navigate} />
          </div>
        </div>
      </section>

      {/* ═══ STATS bar ═══ */}
      <section style={{ padding: "0 28px", position: "relative", zIndex: 2, marginTop: -8 }}>
        <Reveal style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", background: "var(--c-tile)", border: "1px solid var(--c-border-soft)", borderRadius: 18, overflow: "hidden" }}>
          {[{ e: 10000, sep: true, s: "+", l: "MSMEs Assessed" }, { e: 98.2, d: 1, s: "%", l: "ML Accuracy" }, { e: 30, p: "< ", s: "s", l: "Score Generated" }, { e: 11, l: "Loan Products" }].map((x, i) => (
            <div key={i} style={{ padding: "22px 16px", textAlign: "center", borderRight: !isMobile && i < 3 ? "1px solid var(--c-border-soft)" : "none", borderBottom: isMobile && i < 2 ? "1px solid var(--c-border-soft)" : "none" }}>
              <CountUp end={x.e} decimals={x.d || 0} prefix={x.p || ""} suffix={x.s || ""} separator={x.sep}
                style={{ fontSize: 27, fontWeight: 900, background: "linear-gradient(135deg, #93c5fd, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block" }} />
              <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>{x.l}</div>
            </div>
          ))}
        </Reveal>
      </section>

      {/* ═══ PROBLEM statement ═══ */}
      <section style={{ padding: isMobile ? "52px 20px" : "72px 28px" }}>
        <Reveal style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: "#818cf8", fontWeight: 700, marginBottom: 14 }}>THE PROBLEM</div>
          <h2 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 800, color: "var(--c-text)", lineHeight: 1.2, marginBottom: 18, letterSpacing: -1 }}>
            <span style={{ color: "#818cf8" }}>43 million</span> Indian MSMEs are "credit invisible". We fix that.
          </h2>
          <p style={{ fontSize: 16.5, color: "#94a3b8", lineHeight: 1.75 }}>
            Most small businesses can't get a loan because they lack formal balance sheets or a CIBIL history. FinHealth AI reads the <strong style={{ color: "var(--c-text-2)" }}>alternate data they already generate</strong> and produces a bank-grade, explainable credit assessment — for both the business owner and the lending officer.
          </p>
        </Reveal>
      </section>

      {/* ═══ BENTO features ═══ */}
      <section id="features" style={{ padding: isMobile ? "8px 20px 52px" : "8px 28px 72px" }}>
        <SectionHead tag="WHAT IT CAN DO" title="Everything you need to assess credit" isMobile={isMobile} />
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 16, gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gridTemplateAreas: isMobile ? "none" : `"score score chat stat" "score score chat ntc" "pillar pillar loan shap"` }}>
          <Reveal style={{ gridArea: isMobile ? "auto" : "score" }}>
            <div style={{ ...tile, background: "linear-gradient(160deg, var(--c-tile2), var(--c-panel))", padding: 26 }} className="fh-card">
              <div style={{ fontSize: 28, marginBottom: 12 }}>⚡</div>
              <h3 style={{ fontSize: 21, fontWeight: 800, color: "var(--c-text)", marginBottom: 10 }}>Instant Score from GSTIN</h3>
              <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.6, marginBottom: 18 }}>Type a GST number and get a 0–100 financial health score in seconds — no balance sheets, no paperwork.</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: "var(--c-panel)", border: "1px solid var(--c-border-soft)", borderRadius: 14, padding: "14px 18px" }}>
                <ScoreRing target={84} size={72} />
                <div><div style={{ fontSize: 13, color: "#4ade80", fontWeight: 800 }}>Grade A · LOW RISK</div><div style={{ fontSize: 12, color: "#64748b" }}>₹18.5L eligible</div></div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.05} style={{ gridArea: isMobile ? "auto" : "chat" }}>
            <div style={{ ...tile }} className="fh-card">
              <div style={{ fontSize: 22, marginBottom: 8 }}>🤖</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)", marginBottom: 10 }}>Built-in AI Assistant</h3>
              <div style={{ background: "var(--c-panel)", border: "1px solid var(--c-border-soft)", borderRadius: 10, padding: 10, fontSize: 11.5, marginBottom: 8 }}><span style={{ color: "#93c5fd" }}>"How can I improve my cash flow score?"</span></div>
              <div style={{ background: "var(--c-tile2)", border: "1px solid var(--c-border-soft)", borderRadius: 10, padding: 10, fontSize: 11.5, color: "#94a3b8", lineHeight: 1.5 }}>✦ Route UPI collections through your primary account and clear overdue payments…</div>
            </div>
          </Reveal>
          <Reveal delay={0.08} style={{ gridArea: isMobile ? "auto" : "stat" }}>
            <div style={{ ...tile, textAlign: "center", display: "flex", flexDirection: "column", justifyContent: "center" }} className="fh-card">
              <CountUp end={98.2} decimals={1} suffix="%" style={{ fontSize: 32, fontWeight: 900, background: "linear-gradient(135deg, #93c5fd, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }} />
              <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>ML Accuracy</div>
            </div>
          </Reveal>
          <Reveal delay={0.1} style={{ gridArea: isMobile ? "auto" : "ntc" }}>
            <div style={{ ...tile }} className="fh-card">
              <div style={{ fontSize: 22, marginBottom: 8 }}>🌱</div>
              <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "var(--c-text)", marginBottom: 6 }}>New-to-Credit Fair</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>No CIBIL? Scored on GST &amp; cash-flow.</p>
            </div>
          </Reveal>
          <Reveal delay={0.05} style={{ gridArea: isMobile ? "auto" : "pillar" }}>
            <div style={{ ...tile }} className="fh-card">
              <div style={{ fontSize: 22, marginBottom: 8 }}>🧩</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)", marginBottom: 12 }}>5-Pillar Breakdown</h3>
              <Bar l="Cash Flow" v={82} c="#3b82f6" /><Bar l="Compliance" v={91} c="#8b5cf6" /><Bar l="Growth" v={76} c="#06b6d4" />
            </div>
          </Reveal>
          <Reveal delay={0.08} style={{ gridArea: isMobile ? "auto" : "loan" }}>
            <div style={{ ...tile }} className="fh-card">
              <div style={{ fontSize: 22, marginBottom: 8 }}>💰</div>
              <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "var(--c-text)", marginBottom: 6 }}>11 Loan Products</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>MUDRA · CGTMSE · Stand-Up India, auto-matched.</p>
            </div>
          </Reveal>
          <Reveal delay={0.1} style={{ gridArea: isMobile ? "auto" : "shap" }}>
            <div style={{ ...tile }} className="fh-card">
              <div style={{ fontSize: 22, marginBottom: 8 }}>🔍</div>
              <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "var(--c-text)", marginBottom: 6 }}>Explainable AI</h3>
              <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>SHAP shows why — not a black box.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ BIG dashboard mockup ═══ */}
      <section style={{ padding: isMobile ? "20px 20px 52px" : "20px 28px 72px", background: "var(--c-section)", borderTop: "1px solid var(--c-border-soft)", borderBottom: "1px solid var(--c-border-soft)" }}>
        <SectionHead tag="SEE IT IN ACTION" title="One dashboard. Every insight." sub="Score, pillar breakdown, AI assistant and loan decision — all in a single explainable view." isMobile={isMobile} />
        <Reveal style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ background: "var(--c-tile)", border: "1px solid var(--c-border)", borderRadius: 16, overflow: "hidden", boxShadow: "0 40px 90px #000000aa" }}>
            <div style={{ height: 40, background: "var(--c-panel)", borderBottom: "1px solid var(--c-border-soft)", display: "flex", alignItems: "center", gap: 8, padding: "0 16px" }}>
              {["#ef4444", "#f59e0b", "#22c55e"].map((c) => <span key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />)}
              <div style={{ marginLeft: 12, flex: 1, maxWidth: 320, height: 22, background: "var(--c-tile2)", borderRadius: 6, display: "flex", alignItems: "center", padding: "0 12px", fontSize: 11, color: "#475569" }}>🔒 finhealth.ai/dashboard</div>
            </div>
            <div style={{ padding: isMobile ? 16 : 24, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "0.9fr 1.1fr 0.9fr", gap: 16 }}>
              <div style={{ background: "var(--c-tile2)", border: "1px solid var(--c-border-soft)", borderRadius: 14, padding: 18, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1, alignSelf: "flex-start" }}>HEALTH SCORE</div>
                <ScoreRing target={84} size={104} />
                <div style={{ fontSize: 12, fontWeight: 800, color: "#4ade80" }}>Grade A · LOW RISK</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "var(--c-text)" }}>₹18.5L eligible</div>
              </div>
              <div style={{ background: "var(--c-tile2)", border: "1px solid var(--c-border-soft)", borderRadius: 14, padding: 18 }}>
                <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1, marginBottom: 14 }}>5-PILLAR BREAKDOWN</div>
                <Bar l="Cash Flow" v={82} c="#3b82f6" /><Bar l="Compliance" v={91} c="#8b5cf6" /><Bar l="Growth" v={76} c="#06b6d4" /><Bar l="Stability" v={84} c="#f59e0b" /><Bar l="Credit" v={78} c="#ec4899" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "var(--c-tile2)", border: "1px solid var(--c-border-soft)", borderRadius: 14, padding: 16 }}>
                  <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1, marginBottom: 10 }}>🤖 AI ASSISTANT</div>
                  <div style={{ fontSize: 11.5, color: "#93c5fd", marginBottom: 6 }}>"Why is my score 84?"</div>
                  <div style={{ fontSize: 11.5, color: "#94a3b8", lineHeight: 1.5 }}>✦ Strong GST compliance (91) &amp; steady cash flow drive it up…</div>
                </div>
                <div style={{ background: "var(--c-tile)", border: "1px solid #15803d44", borderRadius: 14, padding: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: "#4ade80" }}>✓ APPROVED</div>
                  <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>MSME Loan · 10.5% p.a.</div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" style={{ padding: isMobile ? "52px 20px" : "72px 28px" }}>
        <SectionHead tag="HOW IT WORKS" title="From GSTIN to decision in 4 steps" isMobile={isMobile} />
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: 16 }}>
          {STEPS.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{ ...tile }} className="fh-card">
                <div style={{ width: 40, height: 40, borderRadius: "50%", marginBottom: 16, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, boxShadow: "0 6px 20px #3b82f655" }}>{s.n}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--c-text)", marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal style={{ maxWidth: 1200, margin: "24px auto 0" }}>
          <div style={{ background: "var(--c-section)", border: "1px solid var(--c-border-soft)", borderRadius: 18, padding: "24px" }}>
            <div style={{ textAlign: "center", fontSize: 11.5, letterSpacing: 1.5, color: "#64748b", marginBottom: 20 }}>POWERED BY CONSENTED ALTERNATE DATA</div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
              {DATA_SOURCES.map((s) => (
                <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--c-tile)", border: "1px solid var(--c-border-soft)", borderRadius: 12, padding: "12px 18px", minWidth: 200 }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <div><div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--c-text-2)" }}>{s.label}</div><div style={{ fontSize: 11.5, color: "#64748b" }}>{s.desc}</div></div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ NTC spotlight ═══ */}
      <section style={{ padding: isMobile ? "52px 20px" : "72px 28px", background: "var(--c-section)", borderTop: "1px solid var(--c-border-soft)" }}>
        <Reveal style={{ maxWidth: 1040, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 24 : 48, alignItems: "center" }}>
            <div>
              <div style={{ display: "inline-block", fontSize: 10.5, letterSpacing: 1.5, color: "#4ade80", fontWeight: 700, background: "#15803d18", border: "1px solid #15803d44", padding: "3px 10px", borderRadius: 20, marginBottom: 14 }}>🌱 FAIRNESS BY DESIGN</div>
              <h3 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 800, color: "var(--c-text)", marginBottom: 14, letterSpacing: -0.5 }}>Credit for the credit-invisible</h3>
              <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.7, marginBottom: 18 }}>Traditional banks reject first-time borrowers for having no CIBIL history. In New-to-Credit mode, we drop the credit pillar, re-weight your score around GST &amp; cash-flow, and match you to government-backed schemes.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {["MUDRA Shishu", "MUDRA Kishore", "CGTMSE-backed", "Stand-Up India"].map((t) => (
                  <span key={t} style={{ fontSize: 12.5, color: "#86efac", background: "#15803d18", border: "1px solid #15803d44", padding: "8px 14px", borderRadius: 20 }}>✓ {t}</span>
                ))}
              </div>
            </div>
            <div style={{ ...tile, padding: 26 }}>
              <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1, marginBottom: 12 }}>NTC MODE · WEIGHT REDISTRIBUTED</div>
              <Bar l="Cash Flow" v={30} c="#3b82f6" /><Bar l="Compliance" v={24} c="#8b5cf6" /><Bar l="Growth" v={23} c="#06b6d4" /><Bar l="Stability" v={23} c="#f59e0b" />
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#f87171" }}><span style={{ textDecoration: "line-through" }}>Credit pillar</span> → removed &amp; redistributed</div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ COMPARISON ═══ */}
      <section style={{ padding: isMobile ? "52px 20px" : "72px 28px" }}>
        <SectionHead tag="WHY IT'S DIFFERENT" title="Traditional lending vs FinHealth AI" isMobile={isMobile} />
        <Reveal style={{ maxWidth: 900, margin: "0 auto", background: "var(--c-tile)", border: "1px solid var(--c-border-soft)", borderRadius: 18, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1.2fr 1fr 1fr" : "1.4fr 1fr 1fr" }}>
            <div style={{ padding: "14px 16px", fontSize: 11, color: "#64748b", fontWeight: 700, letterSpacing: 0.5, borderBottom: "1px solid var(--c-border-soft)" }}></div>
            <div style={{ padding: "14px 16px", fontSize: 12, color: "#94a3b8", fontWeight: 700, borderBottom: "1px solid var(--c-border-soft)", background: "var(--c-panel)" }}>Traditional</div>
            <div style={{ padding: "14px 16px", fontSize: 12, color: "#818cf8", fontWeight: 800, borderBottom: "1px solid var(--c-border-soft)", background: "var(--c-tile2)" }}>FinHealth AI</div>
            {COMPARE.map((row, i) => (
              <React.Fragment key={i}>
                <div style={{ padding: "14px 16px", fontSize: 13, color: "var(--c-text-2)", fontWeight: 600, borderBottom: i < COMPARE.length - 1 ? "1px solid var(--c-border-soft)" : "none" }}>{row[0]}</div>
                <div style={{ padding: "14px 16px", fontSize: 12.5, color: "#64748b", borderBottom: i < COMPARE.length - 1 ? "1px solid var(--c-border-soft)" : "none", background: "var(--c-panel)" }}>{row[1]}</div>
                <div style={{ padding: "14px 16px", fontSize: 12.5, color: "#86efac", fontWeight: 600, borderBottom: i < COMPARE.length - 1 ? "1px solid var(--c-border-soft)" : "none", background: "var(--c-tile2)" }}>✓ {row[2]}</div>
              </React.Fragment>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section style={{ padding: isMobile ? "52px 20px" : "72px 28px", background: "var(--c-section)", borderTop: "1px solid var(--c-border-soft)" }}>
        <SectionHead tag="LOVED BY BUSINESSES & BANKERS" title="Real stories, real approvals" isMobile={isMobile} />
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 18 }}>
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{ ...tile, display: "flex", flexDirection: "column", justifyContent: "space-between" }} className="fh-card">
                <div>
                  <div style={{ color: "#fbbf24", fontSize: 14, marginBottom: 10 }}>★★★★★</div>
                  <p style={{ fontSize: 14.5, color: "var(--c-text-2)", lineHeight: 1.65, marginBottom: 18 }}>"{t.quote}"</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--c-surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{t.avatar}</div>
                  <div><div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--c-text)" }}>{t.name}</div><div style={{ fontSize: 11.5, color: "#64748b" }}>{t.role}</div></div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ WHO IT'S FOR ═══ */}
      <section id="audience" style={{ padding: isMobile ? "52px 20px" : "72px 28px" }}>
        <SectionHead tag="WHO IT'S FOR" title="Two portals, one platform" isMobile={isMobile} />
        <div style={{ maxWidth: 1060, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 18 }}>
          <Reveal><div onClick={() => navigate("/owner/login")} style={{ height: "100%", boxSizing: "border-box", background: "linear-gradient(135deg, var(--c-surface), var(--c-tile))", border: "1px solid var(--c-border)", borderRadius: 22, padding: 32, cursor: "pointer" }} className="fh-card">
            <div style={{ fontSize: 32, marginBottom: 14 }}>🏭</div>
            <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>BUSINESS OWNER</div>
            <h3 style={{ fontSize: 21, fontWeight: 800, color: "var(--c-text)", marginBottom: 10 }}>Check Loan Eligibility</h3>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, marginBottom: 18 }}>Get your Financial Health Score, see how much you can borrow, apply in one click, and track your application status.</p>
            <div style={{ fontSize: 13.5, color: "#3b82f6", fontWeight: 700 }}>Get My Score →</div>
          </div></Reveal>
          <Reveal delay={0.1}><div onClick={() => navigate("/manager/login")} style={{ height: "100%", boxSizing: "border-box", background: "linear-gradient(135deg, var(--c-surface), var(--c-tile))", border: "1px solid var(--c-border)", borderRadius: 22, padding: 32, cursor: "pointer" }} className="fh-card">
            <div style={{ fontSize: 32, marginBottom: 14 }}>🏦</div>
            <div style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>BANK MANAGER</div>
            <h3 style={{ fontSize: 21, fontWeight: 800, color: "var(--c-text)", marginBottom: 10 }}>Review Applications</h3>
            <p style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, marginBottom: 18 }}>AI-scored, SHAP-explained credit reports with a portfolio dashboard, analytics, approve/reject flow and one-click PDF exports.</p>
            <div style={{ fontSize: 13.5, color: "#8b5cf6", fontWeight: 700 }}>Open Console →</div>
          </div></Reveal>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" style={{ padding: isMobile ? "52px 20px" : "72px 28px", background: "var(--c-section)", borderTop: "1px solid var(--c-border-soft)" }}>
        <SectionHead tag="FAQ" title="Questions, answered" isMobile={isMobile} />
        <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQS.map((f, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <div onClick={() => setOpenFaq(openFaq === i ? -1 : i)} style={{ background: "var(--c-tile)", border: `1px solid ${openFaq === i ? "#6366f155" : "var(--c-surface)"}`, borderRadius: 14, padding: "16px 20px", cursor: "pointer", transition: "border-color 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--c-text)" }}>{f.q}</div>
                  <div style={{ fontSize: 18, color: "#818cf8", transform: openFaq === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</div>
                </div>
                {openFaq === i && <p style={{ fontSize: 13.5, color: "#94a3b8", lineHeight: 1.65, marginTop: 12 }}>{f.a}</p>}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══ SECURITY ═══ */}
      <section id="security" style={{ padding: isMobile ? "52px 20px" : "72px 28px" }}>
        <SectionHead tag="PRIVACY & SECURITY" title="Consent-first, by design" sub="Data is only ever pulled with the business's explicit consent through the RBI Account Aggregator framework. Every assessment mints a signed, time-bound consent artifact — auditable and revocable." isMobile={isMobile} />
        <Reveal style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 14 }}>
          {["🔒 RBI AA Framework", "📝 Signed Consent Artifact", "⏱ 90-Day Data Life", "🧾 Purpose-Bound Access", "🔑 JWT-Secured", "🚫 No Data Sold"].map((t) => (
            <span key={t} style={{ fontSize: 13, color: "var(--c-text-2)", background: "var(--c-tile)", border: "1px solid var(--c-border-soft)", padding: "9px 16px", borderRadius: 20 }}>{t}</span>
          ))}
        </Reveal>
      </section>

      {/* ═══ CTA band ═══ */}
      <section style={{ padding: isMobile ? "12px 20px 56px" : "20px 28px 72px" }}>
        <Reveal style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center", background: "linear-gradient(135deg, var(--c-surface), var(--c-tile))", border: "1px solid #3b82f644", borderRadius: 24, padding: isMobile ? "40px 24px" : "56px 32px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-40%", left: "50%", width: 460, height: 460, transform: "translateX(-50%)", background: "radial-gradient(circle, #6366f130 0%, transparent 70%)", pointerEvents: "none" }} />
          <h2 style={{ fontSize: isMobile ? 28 : 40, fontWeight: 900, color: "var(--c-text)", marginBottom: 12, letterSpacing: -1, position: "relative" }}>Ready to see your score?</h2>
          <p style={{ fontSize: 16, color: "#94a3b8", marginBottom: 28, position: "relative" }}>It takes under 30 seconds. No documents required.</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", position: "relative" }}>
            <button className="fh-btn fh-btn-primary" onClick={() => navigate("/owner/login")} style={{ background: "linear-gradient(135deg, #3b82f6, #06b6d4)", border: "none", color: "#fff", padding: "15px 32px", borderRadius: 12, fontSize: 15.5, fontWeight: 700, cursor: "pointer", boxShadow: "0 12px 36px #3b82f655" }}>Get My Business Score <span className="fh-arrow">→</span></button>
            <button className="fh-btn" onClick={() => navigate("/manager/login")} style={{ background: "transparent", border: "1px solid #475569", color: "var(--c-text-2)", padding: "15px 32px", borderRadius: 12, fontSize: 15.5, fontWeight: 700, cursor: "pointer" }}>Bank Officer Login</button>
          </div>
        </Reveal>
      </section>

      <LandingFooter navigate={navigate} />
    </div>
  );
}
