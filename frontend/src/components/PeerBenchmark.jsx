import React, { useEffect, useState } from "react";
import api from "../api/client";

const PILLAR_LABELS = {
  cash_flow: { label: "Cash Flow", color: "#3b82f6" },
  compliance: { label: "Compliance", color: "#8b5cf6" },
  growth: { label: "Growth", color: "#06b6d4" },
  stability: { label: "Stability", color: "#f59e0b" },
  credit_worthiness: { label: "Credit", color: "#ec4899" },
};

function Percentile({ value }) {
  const color = value >= 75 ? "#22c55e" : value >= 50 ? "#eab308" : value >= 25 ? "#f97316" : "#ef4444";
  const label = value >= 75 ? "Top Performer" : value >= 50 ? "Above Average" : value >= 25 ? "Below Average" : "Needs Improvement";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "3px 12px", borderRadius: 20,
      background: `${color}18`, border: `1px solid ${color}33`,
      fontSize: 12, fontWeight: 700, color,
    }}>{label}</div>
  );
}

export default function PeerBenchmark({ businessType, city, myScores }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!businessType || !city) return;
    setLoading(true);
    api.get(`/api/score/benchmark?business_type=${encodeURIComponent(businessType)}&city=${encodeURIComponent(city)}`)
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [businessType, city]);

  if (loading) return (
    <div>
      <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 16 }}>PEER BENCHMARKING</div>
      <div style={{ color: "#475569", fontSize: 13, padding: "20px 0" }}>Loading benchmark data…</div>
    </div>
  );

  if (!data) return null;

  const hasMyScore = myScores != null;
  const overall    = hasMyScore ? myScores.overall : null;
  const peerMean   = data.overall.mean;
  const peerMedian = data.overall.median;
  const peerP75    = data.overall.p75;

  let percentile = null;
  if (hasMyScore) {
    percentile = 50;
    if (overall >= data.overall.p75) percentile = 75 + ((overall - data.overall.p75) / (100 - data.overall.p75)) * 25;
    else if (overall >= peerMedian) percentile = 50 + ((overall - peerMedian) / (data.overall.p75 - peerMedian)) * 25;
    else if (overall >= data.overall.p25) percentile = 25 + ((overall - data.overall.p25) / (peerMedian - data.overall.p25)) * 25;
    else percentile = (overall / data.overall.p25) * 25;
    percentile = Math.round(Math.min(99, Math.max(1, percentile)));
  }

  const overallBars = hasMyScore
    ? [
        { label: "Your Score",   value: overall,    color: overall >= peerMean ? "#22c55e" : "#f97316", main: true },
        { label: "Industry Avg", value: peerMean,   color: "#3b82f6" },
        { label: "Median",       value: peerMedian, color: "#8b5cf6" },
        { label: "Top 25%",      value: peerP75,    color: "#06b6d4" },
      ]
    : [
        { label: "Industry Avg", value: peerMean,          color: "#3b82f6" },
        { label: "Median",       value: peerMedian,        color: "#8b5cf6" },
        { label: "Top 25%",      value: peerP75,           color: "#06b6d4" },
        { label: "Bottom 25%",   value: data.overall.p25,  color: "#ef4444" },
      ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5 }}>PEER BENCHMARKING</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>
            {data.sample_size} {businessType} businesses in {city}
          </div>
        </div>
        {percentile != null && <Percentile value={percentile} />}
      </div>

      {/* Overall comparison */}
      <div style={{
        background: "#0f172a", border: "1px solid #334155",
        borderRadius: 14, padding: "18px 20px", marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1, marginBottom: 14 }}>
          {hasMyScore ? "OVERALL SCORE vs INDUSTRY" : "INDUSTRY SCORE DISTRIBUTION"}
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, marginBottom: hasMyScore ? 14 : 0 }}>
          {overallBars.map(({ label, value, color, main }) => (
            <div key={label} style={{ flex: 1, textAlign: "center" }}>
              <div style={{
                background: `${color}22`, border: `1px solid ${color}44`,
                borderRadius: "6px 6px 0 0",
                height: `${(value / 100) * 120}px`, minHeight: 20,
                display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 4,
              }}>
                <span style={{ fontSize: main ? 16 : 13, fontWeight: 800, color }}>{value}</span>
              </div>
              <div style={{ fontSize: 10, color: "#475569", marginTop: 5, lineHeight: 1.3 }}>{label}</div>
            </div>
          ))}
        </div>
        {hasMyScore && (
          <div style={{
            padding: "10px 14px", borderRadius: 10,
            background: overall >= peerMean ? "#15803d11" : "#ea580c11",
            border: `1px solid ${overall >= peerMean ? "#15803d33" : "#ea580c33"}`,
            fontSize: 12,
            color: overall >= peerMean ? "#86efac" : "#fdba74",
          }}>
            {overall >= peerMean
              ? `✓ Your score is ${(overall - peerMean).toFixed(1)} points above the ${businessType} industry average in ${city}.`
              : `Your score is ${(peerMean - overall).toFixed(1)} points below the ${businessType} industry average. Use the simulator to see how to close the gap.`
            }
          </div>
        )}
      </div>

      {/* Pillar comparison */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Object.entries(PILLAR_LABELS).map(([key, { label, color }]) => {
          const mine = hasMyScore ? myScores[key] : null;
          const avg = data.pillars[key]?.mean || 0;
          const diff = mine != null ? +(mine - avg).toFixed(1) : null;
          const maxVal = mine != null ? Math.max(mine, avg, 100) : 100;
          return (
            <div key={key} style={{
              background: "#0f172a", border: "1px solid #1e293b",
              borderRadius: 12, padding: "12px 16px",
              display: "grid",
              gridTemplateColumns: mine != null ? "80px 1fr 60px 60px" : "80px 1fr 60px",
              alignItems: "center", gap: 12,
            }}>
              <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
              <div style={{ position: "relative", height: 6, background: "#1e293b", borderRadius: 3 }}>
                <div style={{
                  position: "absolute", left: `${(avg / maxVal) * 100}%`,
                  top: -3, width: 2, height: 12, background: "#475569",
                  transform: "translateX(-50%)", borderRadius: 1,
                }} />
                {mine != null && (
                  <div style={{
                    position: "absolute", left: 0, top: 0,
                    width: `${(mine / maxVal) * 100}%`,
                    height: "100%", background: color,
                    borderRadius: 3, transition: "width 0.4s",
                  }} />
                )}
              </div>
              <div style={{ fontSize: 11, color: "#475569", textAlign: "center" }}>avg {avg}</div>
              {diff != null && (
                <div style={{ fontSize: 12, fontWeight: 700, textAlign: "right",
                  color: diff >= 0 ? "#22c55e" : "#ef4444" }}>
                  {diff >= 0 ? "+" : ""}{diff}
                </div>
              )}
            </div>
          );
        })}
        <div style={{ fontSize: 10, color: "#334155", textAlign: "right", marginTop: 4 }}>
          ▏ = industry average
        </div>
      </div>
    </div>
  );
}
