import React, { useState, useMemo, useRef, useEffect } from "react";
import useIsMobile from "../hooks/useIsMobile";

function clip(v, min, max) { return Math.min(Math.max(v, min), max); }

// Smoothly tweens a display number toward `value` whenever it changes,
// so dragging a slider animates the score instead of snapping.
function useTween(value, duration = 350) {
  const [display, setDisplay] = useState(value);
  const raf = useRef(null);
  const from = useRef(value);
  useEffect(() => {
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    const startVal = from.current;
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(startVal + (value - startVal) * eased);
      if (t < 1) raf.current = requestAnimationFrame(step);
      else from.current = value;
    }
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);
  return display;
}

function computeScores(f, ntc = false, hasGstin = true) {
  // Weights in each pillar already sum to 100 and features are 0–1, so the weighted
  // sum is already on a 0–100 scale. (Must match backend compute_pillar_scores — an
  // extra ×100 here overflowed every pillar to 100, faking a huge simulated gain.)
  const cf = f.cash_flow_ratio * 35 + f.inflow_stability * 25 + (1 - f.bounce_rate) * 25 + Math.min(f.avg_balance_ratio, 1) * 15;
  // No GSTIN — Compliance is 100% EPFO, matching the backend's no-GSTIN formula.
  const comp = hasGstin
    ? f.gst_compliance * 50 + f.epfo_compliance * 35 + Math.min(f.tax_to_revenue / 0.18, 1) * 15
    : f.epfo_compliance * 100;
  const rev_growth_norm = clip(0.5 + f.revenue_growth * 0.8, 0, 1);
  const emp_growth_norm = clip(0.5 + (f.emp_growth || 0) * 0.8, 0, 1);
  const trend_norm = clip((f.revenue_trend_norm || 0) + 0.5, 0, 1);
  const growth = rev_growth_norm * 45 + emp_growth_norm * 30 + trend_norm * 25;
  const rev_stability = Math.max(0, 1 - f.revenue_cv);
  const buyer_div_norm = Math.min(f.buyer_diversity / 20, 1);
  const years_norm = Math.min(f.years_in_business / 10, 1);
  const stability = rev_stability * 35 + buyer_div_norm * 25 + f.salary_stability * 20 + years_norm * 20;
  const credit = f.has_credit_history
    ? f.credit_score_norm * 80 - (f.dpd_30 * 5 + f.dpd_90 * 15) + 20
    : 40;

  const cfs = clip(cf, 0, 100);
  const cos = clip(comp, 0, 100);
  const gs = clip(growth, 0, 100);
  const ss = clip(stability, 0, 100);
  const cs = clip(credit, 0, 100);
  // NTC mode: drop the credit pillar and redistribute its weight (matches backend
  // compute_pillar_scores), so the simulator's baseline equals the shown score.
  const overall = ntc
    ? cfs * 0.30 + cos * 0.24 + gs * 0.23 + ss * 0.23
    : cfs * 0.25 + cos * 0.20 + gs * 0.20 + ss * 0.20 + cs * 0.15;

  return {
    cash_flow: Math.round(cfs * 10) / 10,
    compliance: Math.round(cos * 10) / 10,
    growth: Math.round(gs * 10) / 10,
    stability: Math.round(ss * 10) / 10,
    credit_worthiness: ntc ? null : Math.round(cs * 10) / 10,
    overall: Math.round(overall * 10) / 10,
  };
}

function getRisk(score) {
  if (score >= 75) return { band: "LOW", color: "#22c55e", multiplier: 4.5 };
  if (score >= 60) return { band: "MEDIUM-LOW", color: "#eab308", multiplier: 3.0 };
  if (score >= 45) return { band: "MEDIUM", color: "#f97316", multiplier: 1.5 };
  return { band: "HIGH", color: "#ef4444", multiplier: 0 };
}

const LEVERS = [
  { key: "gst_compliance", label: "GST Filing Compliance", icon: "📊", min: 0, max: 1, step: 0.01, format: v => `${Math.round(v * 100)}%`, pillar: "Compliance" },
  { key: "epfo_compliance", label: "EPFO Compliance", icon: "👥", min: 0, max: 1, step: 0.01, format: v => `${Math.round(v * 100)}%`, pillar: "Compliance" },
  { key: "credit_score_norm", label: "Credit Score (CIBIL)", icon: "💳", min: 0.33, max: 1, step: 0.01, format: v => Math.round(v * 900), pillar: "Credit" },
  { key: "bounce_rate", label: "Payment Bounce Rate", icon: "🏦", min: 0, max: 0.3, step: 0.005, format: v => `${(v * 100).toFixed(1)}%`, pillar: "Cash Flow", invert: true },
  { key: "revenue_growth", label: "Revenue Growth (YoY)", icon: "🚀", min: -0.5, max: 2, step: 0.05, format: v => `${v >= 0 ? "+" : ""}${Math.round(v * 100)}%`, pillar: "Growth" },
];

const PILLAR_COLORS = {
  cash_flow: "#3b82f6",
  compliance: "#8b5cf6",
  growth: "#06b6d4",
  stability: "#f59e0b",
  credit_worthiness: "#ec4899",
};

// Safe defaults used when rawFeatures is null/missing
const FALLBACK_FEATURES = {
  gst_compliance: 0.8, epfo_compliance: 0.8,
  credit_score_norm: 0.67, bounce_rate: 0.05, revenue_growth: 0.1,
};

export default function ScoreSimulator({ rawFeatures, currentScores, avgMonthlyRevenue, hasGstin = true }) {
  // rawFeatures can be null/undefined if the record pre-dates raw_features storage.
  // We must call all hooks unconditionally (Rules of Hooks), so we fall back to
  // safe defaults and render a disabled state instead of crashing.
  const isMobile = useIsMobile();
  const safeFeatures = rawFeatures || FALLBACK_FEATURES;
  // No GSTIN — the GST slider doesn't apply, since Compliance is scored purely from EPFO.
  const levers = hasGstin ? LEVERS : LEVERS.filter(l => l.key !== "gst_compliance");

  const [sliders, setSliders] = useState({
    gst_compliance: safeFeatures.gst_compliance,
    epfo_compliance: safeFeatures.epfo_compliance,
    credit_score_norm: safeFeatures.credit_score_norm,
    bounce_rate: safeFeatures.bounce_rate,
    revenue_growth: safeFeatures.revenue_growth,
  });

  // NTC businesses have no credit pillar — the backend redistributes its weight.
  const isNtc = currentScores?.credit_worthiness == null;
  const simFeatures = useMemo(() => ({ ...safeFeatures, ...sliders }), [sliders, safeFeatures]);
  const simScores = useMemo(() => computeScores(simFeatures, isNtc, hasGstin), [simFeatures, isNtc, hasGstin]);

  const delta = Math.round((simScores.overall - currentScores.overall) * 10) / 10;
  const animatedSim = useTween(simScores.overall);
  const currentRisk = getRisk(currentScores.overall);
  const simRisk = getRisk(simScores.overall);
  const bandChanged = simRisk.band !== currentRisk.band;

  const simLoan = simRisk.multiplier * (avgMonthlyRevenue || 0);
  const currentLoan = currentRisk.multiplier * (avgMonthlyRevenue || 0);
  const loanDelta = simLoan - currentLoan;

  const reset = () => setSliders({
    gst_compliance: safeFeatures.gst_compliance,
    epfo_compliance: safeFeatures.epfo_compliance,
    credit_score_norm: safeFeatures.credit_score_norm,
    bounce_rate: safeFeatures.bounce_rate,
    revenue_growth: safeFeatures.revenue_growth,
  });

  const isChanged = levers.some(l => Math.abs(sliders[l.key] - safeFeatures[l.key]) > 0.001);

  return (
    <div>
      {!rawFeatures && (
        <div style={{
          background: "#1c1100", border: "1px solid #f59e0b33",
          borderRadius: 10, padding: "10px 16px", marginBottom: 16,
          fontSize: 12, color: "#fbbf24",
        }}>
          ⚠ Simulating with default values — raw feature data not available for this record.
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5 }}>SCORE SIMULATOR</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>
            Drag the sliders to see how improving key metrics impacts your score
          </div>
        </div>
        {isChanged && (
          <button onClick={reset} style={{
            padding: "6px 14px", background: "transparent",
            border: "1px solid var(--c-border)", borderRadius: 8,
            color: "#64748b", fontSize: 12, cursor: "pointer",
          }}>Reset</button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>

        {/* Sliders */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {levers.map((lever) => {
            const current = safeFeatures[lever.key];
            const val = sliders[lever.key];
            const changed = Math.abs(val - current) > 0.001;
            return (
              <div key={lever.key}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 14 }}>{lever.icon}</span>
                    <span style={{ fontSize: 12, color: "#cbd5e1" }}>{lever.label}</span>
                    <span style={{
                      fontSize: 10, padding: "1px 6px", borderRadius: 10,
                      background: "var(--c-surface-2)", color: "#64748b",
                    }}>{lever.pillar}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {changed && (
                      <span style={{ fontSize: 10, color: "#475569", textDecoration: "line-through" }}>
                        {lever.format(current)}
                      </span>
                    )}
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      color: changed ? (lever.invert ? (val < current ? "#22c55e" : "#ef4444") : (val > current ? "#22c55e" : "#ef4444")) : "var(--c-text)",
                    }}>
                      {lever.format(val)}
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min={lever.min}
                  max={lever.max}
                  step={lever.step}
                  value={val}
                  onChange={e => setSliders(s => ({ ...s, [lever.key]: parseFloat(e.target.value) }))}
                  style={{ width: "100%", accentColor: "#3b82f6", cursor: "pointer" }}
                />
              </div>
            );
          })}
        </div>

        {/* Results panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Score comparison */}
          <div style={{
            background: "var(--c-bg)", border: "1px solid var(--c-border)",
            borderRadius: 14, padding: "18px 20px",
          }}>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1.5, marginBottom: 14 }}>OVERALL SCORE</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>NOW</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: currentRisk.color }}>{currentScores.overall}</div>
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{
                  fontSize: 22, fontWeight: 800,
                  color: delta > 0 ? "#22c55e" : delta < 0 ? "#ef4444" : "#475569",
                }}>
                  {delta > 0 ? `+${delta}` : delta === 0 ? "—" : delta}
                </div>
                {bandChanged && (
                  <div style={{
                    fontSize: 10, marginTop: 4, padding: "2px 8px",
                    background: `${simRisk.color}22`, border: `1px solid ${simRisk.color}44`,
                    borderRadius: 20, color: simRisk.color, fontWeight: 700,
                  }}>
                    {simScores.overall >= currentScores.overall ? "Band Upgrade!" : "Band Downgrade"}
                  </div>
                )}
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>SIMULATED</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: simRisk.color }}>{animatedSim.toFixed(1)}</div>
              </div>
            </div>
          </div>

          {/* Risk band */}
          <div style={{
            background: "var(--c-bg)", border: `1px solid ${simRisk.color}33`,
            borderRadius: 14, padding: "14px 18px",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 4 }}>RISK BAND</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: simRisk.color }}>{simRisk.band}</div>
            </div>
            {loanDelta !== 0 && (
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "#475569", marginBottom: 4 }}>LOAN IMPACT</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: loanDelta > 0 ? "#22c55e" : "#ef4444" }}>
                  {loanDelta > 0 ? "+" : ""}₹{(Math.abs(loanDelta) / 100000).toFixed(1)}L
                </div>
              </div>
            )}
          </div>

          {/* Pillar comparison */}
          <div style={{
            background: "var(--c-bg)", border: "1px solid var(--c-border)",
            borderRadius: 14, padding: "14px 18px",
          }}>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1.5, marginBottom: 12 }}>PILLAR IMPACT</div>
            {[
              { key: "cash_flow", label: "Cash Flow" },
              { key: "compliance", label: "Compliance" },
              { key: "growth", label: "Growth" },
              { key: "stability", label: "Stability" },
              ...(isNtc ? [] : [{ key: "credit_worthiness", label: "Credit" }]),
            ].map(p => {
              const d = Math.round((simScores[p.key] - currentScores[p.key]) * 10) / 10;
              const color = PILLAR_COLORS[p.key];
              return (
                <div key={p.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 70, fontSize: 11, color: "#64748b" }}>{p.label}</div>
                  <div style={{ flex: 1, height: 5, background: "var(--c-surface)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", width: `${simScores[p.key]}%`,
                      background: color, borderRadius: 3, transition: "width 0.3s ease",
                    }} />
                  </div>
                  <div style={{ width: 32, fontSize: 11, fontWeight: 700, textAlign: "right",
                    color: d > 0 ? "#22c55e" : d < 0 ? "#ef4444" : "#475569",
                  }}>
                    {d > 0 ? `+${d}` : d === 0 ? "" : d}
                  </div>
                  <div style={{ width: 28, fontSize: 12, fontWeight: 700, color, textAlign: "right" }}>
                    {simScores[p.key]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
