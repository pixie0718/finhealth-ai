import React, { useEffect, useState } from "react";
import { getHistory } from "../api/client";
import useIsMobile from "../hooks/useIsMobile";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

const riskColors = {
  "LOW": "#22c55e",
  "MEDIUM-LOW": "#eab308",
  "MEDIUM": "#f97316",
  "HIGH": "#ef4444",
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ color: "#f1f5f9", fontWeight: 700, marginBottom: 4 }}>{d.name}</div>
      <div style={{ color: "#3b82f6", fontWeight: 800, fontSize: 18 }}>{d.score}</div>
      <div style={{ color: riskColors[d.risk], marginTop: 2 }}>{d.risk}</div>
      <div style={{ color: "#475569", marginTop: 2 }}>{d.date}</div>
    </div>
  );
};

export default function ScoreHistory({ onView }) {
  const isMobile = useIsMobile();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getHistory()
      .then((r) => setRecords(r.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const chartData = [...records]
    .reverse()
    .map((r, i) => ({
      name: r.business_name,
      score: r.pillar_scores?.overall ?? 0,
      risk: r.loan_eligibility?.risk_band,
      date: new Date(r.generated_at).toLocaleDateString("en-IN"),
      idx: i + 1,
      raw: r,
    }));

  const avg = records.length
    ? (records.reduce((a, r) => a + (r.pillar_scores?.overall ?? 0), 0) / records.length).toFixed(1)
    : 0;

  const low = records.filter(r => (r.loan_eligibility?.risk_band) === "LOW").length;

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "#475569" }}>Loading history...</div>;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>Score History</h2>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>{records.length} assessments on record</p>
      </div>

      {error ? (
        <div style={{
          background: "#1c1010", border: "1px solid #dc262633", borderRadius: 20,
          padding: 48, textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
          <div style={{ color: "#fca5a5", fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Couldn't reach the server</div>
          <div style={{ color: "#64748b", fontSize: 13, marginBottom: 18 }}>Make sure the backend is running on port 8000.</div>
          <button onClick={load} style={{
            padding: "10px 24px", borderRadius: 10, border: "1px solid #ef444455",
            background: "#dc262611", color: "#f87171", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>↻ Retry</button>
        </div>
      ) : records.length === 0 ? (
        <div style={{
          background: "#1e293b", border: "1px solid #334155", borderRadius: 20,
          padding: 48, textAlign: "center",
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <div style={{ color: "#64748b", fontSize: 14 }}>No history yet. Generate scores to see the trend here.</div>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
            {[
              { label: "TOTAL ASSESSMENTS", value: records.length, sub: "All time", color: "#93c5fd" },
              { label: "AVERAGE SCORE", value: avg, sub: "Across all assessments", color: "#a78bfa" },
              { label: "LOW RISK APPROVALS", value: low, sub: `${((low / records.length) * 100).toFixed(0)}% approval rate`, color: "#22c55e" },
            ].map((s, i) => (
              <div key={i} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "18px 22px" }}>
                <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1.5, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Score trend chart */}
          {chartData.length > 1 && (
            <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: 28, marginBottom: 24 }}>
              <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 16 }}>SCORE TREND OVER TIME</div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b40" />
                  <XAxis dataKey="idx" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `#${v}`} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={75} stroke="#22c55e33" strokeDasharray="4 4" label={{ value: "LOW risk", fill: "#22c55e", fontSize: 10, position: "right" }} />
                  <ReferenceLine y={60} stroke="#eab30833" strokeDasharray="4 4" label={{ value: "MED-LOW", fill: "#eab308", fontSize: 10, position: "right" }} />
                  <ReferenceLine y={45} stroke="#f9731633" strokeDasharray="4 4" label={{ value: "MEDIUM", fill: "#f97316", fontSize: 10, position: "right" }} />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5}
                    dot={{ fill: "#3b82f6", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#93c5fd" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Records list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {records.map((r) => {
              const color = riskColors[r.loan_eligibility?.risk_band] || "#64748b";
              const score = r.pillar_scores?.overall ?? 0;
              return (
                <div key={r.msme_id}
                  onClick={() => onView(r)}
                  style={{
                    background: "#1e293b", border: "1px solid #334155",
                    borderRadius: 14, padding: "16px 22px",
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between", flexWrap: "wrap", gap: 12,
                    cursor: "pointer", transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = "#3b82f6"}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = "#334155"}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: `${color}22`, border: `1px solid ${color}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 17, fontWeight: 800, color,
                    }}>{Math.round(score)}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#f1f5f9" }}>{r.business_name}</div>
                      <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                        {r.city} • {r.business_type} • {new Date(r.generated_at).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>LOAN</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>
                        ₹{((r.loan_eligibility?.eligible_loan_amount ?? 0) / 100000).toFixed(1)}L
                      </div>
                    </div>
                    <div style={{
                      padding: "3px 12px", borderRadius: 20,
                      background: `${color}22`, border: `1px solid ${color}44`,
                      fontSize: 11, fontWeight: 700, color,
                    }}>{r.loan_eligibility?.risk_band}</div>
                    <div style={{ color: "#3b82f6", fontSize: 13 }}>View →</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
