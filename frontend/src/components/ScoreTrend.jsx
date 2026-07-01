import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { getTrend } from "../api/client";

const riskColors = { LOW: "#22c55e", "MEDIUM-LOW": "#eab308", MEDIUM: "#f97316", HIGH: "#ef4444" };

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = riskColors[d.risk] || "#64748b";
  return (
    <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, padding: "10px 14px", fontSize: 12 }}>
      <div style={{ color: "#f1f5f9", fontWeight: 700, marginBottom: 4 }}>{d.date}</div>
      <div style={{ fontSize: 20, fontWeight: 900, color: payload[0].color }}>{d.score}</div>
      <div style={{ color, marginTop: 2, fontSize: 11 }}>{d.risk}</div>
    </div>
  );
};

export default function ScoreTrend({ gstin, currentScore }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gstin) { setLoading(false); return; }
    getTrend(gstin)
      .then(r => setRecords(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [gstin]);

  if (loading || records.length < 2) return null;

  const chartData = records.map((r, i) => ({
    idx: i + 1,
    score: r.overall ?? 0,
    risk: r.risk_band,
    date: new Date(r.generated_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
  }));

  const first = chartData[0].score;
  const last = chartData[chartData.length - 1].score;
  const delta = +(last - first).toFixed(1);
  const trend = delta > 0 ? "improving" : delta < 0 ? "declining" : "stable";
  const trendColor = delta > 0 ? "#22c55e" : delta < 0 ? "#ef4444" : "#64748b";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5 }}>YOUR SCORE JOURNEY</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>
            {records.length} assessments for this business
          </div>
        </div>
        <div style={{
          padding: "4px 14px", borderRadius: 20,
          background: `${trendColor}18`, border: `1px solid ${trendColor}33`,
          fontSize: 12, fontWeight: 700, color: trendColor,
        }}>
          {delta > 0 ? "↑" : delta < 0 ? "↓" : "→"} {delta > 0 ? `+${delta}` : delta} pts • {trend}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[Math.max(0, Math.min(...chartData.map(d => d.score)) - 10), 100]}
            tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={75} stroke="#22c55e33" strokeDasharray="4 4" />
          <ReferenceLine y={60} stroke="#eab30833" strokeDasharray="4 4" />
          <ReferenceLine y={45} stroke="#f9731633" strokeDasharray="4 4" />
          <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2.5}
            dot={({ cx, cy, payload }) => {
              const color = riskColors[payload.risk] || "#3b82f6";
              return <circle key={`dot-${payload.idx}`} cx={cx} cy={cy} r={5} fill={color} stroke="#0f172a" strokeWidth={2} />;
            }}
            activeDot={{ r: 7, fill: "#93c5fd", stroke: "#0f172a", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
