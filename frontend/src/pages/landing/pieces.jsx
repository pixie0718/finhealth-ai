import React, { useEffect, useRef, useState } from "react";
import useIsMobile from "../../hooks/useIsMobile";
import CountUp from "../../components/CountUp";
import ThemeToggle from "../../components/ThemeToggle";
import Logo from "../../components/Logo";
import { STATS, HERO_PILLARS } from "./data";

export const accent = "#6366f1";

export function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── Header ───────────────────────────────────────────────────────────────
export function LandingHeader({ navigate }) {
  const isMobile = useIsMobile();
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "var(--c-header)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--c-border)",
    }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 28px", height: 66, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => scrollTo("top")}>
          <Logo size={52} />
        </div>
        {!isMobile && (
          <nav style={{ display: "flex", gap: 30 }}>
            {[["Features", "features"], ["How it Works", "how"], ["Who it's For", "audience"]].map(([l, id]) => (
              <button key={id} className="fh-nav" onClick={() => scrollTo(id)} style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 13.5, cursor: "pointer", fontWeight: 500 }}>{l}</button>
            ))}
          </nav>
        )}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <ThemeToggle size={36} />
          <button className="fh-btn" onClick={() => navigate("/owner/login")} style={{ background: "transparent", border: "1px solid var(--c-border)", color: "var(--c-text-2)", padding: "8px 14px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{isMobile ? "Business" : "Business Login"}</button>
          <button className="fh-btn fh-btn-primary" onClick={() => navigate("/manager/login")} style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", border: "none", color: "#fff", padding: "8px 14px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>{isMobile ? "Bank" : "Bank Login"}</button>
        </div>
      </div>
    </header>
  );
}

// ─── Animated score ring ────────────────────────────────────────────────────
export function ScoreRing({ target = 84, size = 100 }) {
  const ref = useRef(null);
  const started = useRef(false);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = performance.now();
        const tick = (now) => { const t = Math.min(1, (now - t0) / 1500); setV(target * (1 - Math.pow(1 - t, 3))); if (t < 1) requestAnimationFrame(tick); else setV(target); };
        requestAnimationFrame(tick); io.disconnect();
      }
    }), { threshold: 0.4 });
    io.observe(el); return () => io.disconnect();
  }, [target]);
  const deg = (v / 100) * 360;
  const inner = size - 14;
  return (
    <div ref={ref} style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: `conic-gradient(#22c55e ${deg}deg, var(--c-surface) ${deg}deg)` }} />
      <div style={{ position: "absolute", inset: 7, width: inner, height: inner, borderRadius: "50%", background: "var(--c-panel)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: size * 0.3, fontWeight: 900, color: "var(--c-text)", lineHeight: 1 }}>{Math.round(v)}</div>
        <div style={{ fontSize: 9, color: "#64748b" }}>/ 100</div>
      </div>
    </div>
  );
}

// ─── Product mock card (Financial Health Report) ────────────────────────────
export function ProductCard({ navigate, float = true }) {
  return (
    <div style={{
      background: "linear-gradient(160deg, var(--c-tile), var(--c-panel))", border: "1px solid var(--c-border)",
      borderRadius: 22, padding: 24, boxShadow: "0 30px 70px #00000088, inset 0 1px 0 #ffffff0f",
      animation: float ? "fhFloat 6s ease-in-out infinite" : "none",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 9.5, color: "#64748b", letterSpacing: 1.2, fontWeight: 700 }}>FINANCIAL HEALTH REPORT</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: "var(--c-text)", marginTop: 3 }}>Sharma Textiles</div>
          <div style={{ fontSize: 10.5, color: "#475569", marginTop: 1 }}>27AAPFU0939F1ZV · Surat</div>
        </div>
        <div style={{ fontSize: 10, fontWeight: 800, color: "#22c55e", background: "#15803d22", border: "1px solid #15803d55", padding: "3px 10px", borderRadius: 20 }}>LOW RISK</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}>
        <ScoreRing target={84} size={96} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#4ade80" }}>Grade A · Excellent</div>
          <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 4 }}>Eligible loan amount</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--c-text)" }}>₹18.5L</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 18 }}>
        {HERO_PILLARS.map((p) => (
          <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 72, fontSize: 11, color: "#94a3b8" }}>{p.label}</div>
            <div style={{ flex: 1, height: 6, background: "var(--c-surface)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: `${p.val}%`, height: "100%", background: p.color, borderRadius: 4, animation: "fhGrow 1.1s ease-out" }} />
            </div>
            <div style={{ width: 22, fontSize: 11, fontWeight: 700, color: "var(--c-text-2)", textAlign: "right" }}>{p.val}</div>
          </div>
        ))}
      </div>
      <button className="fh-btn fh-btn-primary" onClick={() => navigate("/owner/login")} style={{ width: "100%", background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", color: "#fff", padding: "11px", borderRadius: 12, fontSize: 13.5, fontWeight: 800, cursor: "pointer" }}>✓ APPROVED — Apply Now</button>
    </div>
  );
}

// ─── Stats row ───────────────────────────────────────────────────────────────
export function StatsRow({ isMobile }) {
  return (
    <div style={{
      display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
      background: "var(--c-tile)", border: "1px solid var(--c-border-soft)", borderRadius: 16, overflow: "hidden", backdropFilter: "blur(6px)",
    }}>
      {STATS.map((s, i) => (
        <div key={i} style={{ padding: "20px 16px", textAlign: "center", borderRight: !isMobile && i < STATS.length - 1 ? "1px solid var(--c-border-soft)" : "none", borderBottom: isMobile && i < 2 ? "1px solid var(--c-border-soft)" : "none" }}>
          <CountUp end={s.end} decimals={s.decimals || 0} prefix={s.prefix || ""} suffix={s.suffix || ""} separator={s.separator}
            style={{ fontSize: 25, fontWeight: 900, background: "linear-gradient(135deg, #93c5fd, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", display: "inline-block" }} />
          <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 4 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
export function LandingFooter({ navigate }) {
  return (
    <footer style={{ borderTop: "1px solid var(--c-border-soft)", background: "var(--c-deepest)", padding: "40px 28px 28px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 28 }}>
        <div style={{ maxWidth: 300 }}>
          <div style={{ marginBottom: 12 }}>
            <Logo size={44} />
          </div>
          <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6 }}>Explainable MSME credit scoring on alternate data. Built for IDBI Innovate 2026.</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="fh-btn fh-btn-primary" onClick={() => navigate("/owner/login")} style={{ background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", border: "none", color: "#fff", padding: "11px 22px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer", height: "fit-content" }}>Get My Score <span className="fh-arrow">→</span></button>
        </div>
      </div>
      <div style={{ maxWidth: 1240, margin: "26px auto 0", borderTop: "1px solid var(--c-border-soft)", paddingTop: 18, fontSize: 12.5, color: "#475569", display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10 }}>
        <span>© 2026 FinHealth AI · IDBI Innovate 2026 · Prototype</span>
        <span>🔒 RBI Account Aggregator Compliant</span>
      </div>
    </footer>
  );
}
