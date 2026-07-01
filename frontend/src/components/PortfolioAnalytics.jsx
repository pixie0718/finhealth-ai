import React from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import useIsMobile from "../hooks/useIsMobile";

const BANDS = ["LOW", "MEDIUM-LOW", "MEDIUM", "HIGH"];
const bandColor = { LOW: "#22c55e", "MEDIUM-LOW": "#eab308", MEDIUM: "#f97316", HIGH: "#ef4444" };

const card = {
  background: "#1e293b", border: "1px solid #334155",
  borderRadius: 16, padding: "18px 20px",
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 10, padding: "8px 12px", fontSize: 12 }}>
      <div style={{ color: "#f1f5f9", fontWeight: 700 }}>{label ?? payload[0].name}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || p.payload?.fill || "#93c5fd" }}>
          {p.name}: <b>{p.value}</b>
        </div>
      ))}
    </div>
  );
};

export default function PortfolioAnalytics({ records }) {
  const isMobile = useIsMobile();
  if (!records || records.length === 0) return null;

  // Risk-band distribution
  const bandData = BANDS
    .map((b) => ({ name: b, value: records.filter((r) => r.loan_eligibility?.risk_band === b).length }))
    .filter((d) => d.value > 0);

  // Sector-wise average score
  const sectors = {};
  records.forEach((r) => {
    const t = r.business_type || "Other";
    (sectors[t] = sectors[t] || []).push(r.pillar_scores?.overall ?? 0);
  });
  const sectorData = Object.entries(sectors)
    .map(([name, arr]) => ({ name, avg: +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) }))
    .sort((a, b) => b.avg - a.avg)
    .slice(0, 8);

  const avgScore = (records.reduce((a, r) => a + (r.pillar_scores?.overall ?? 0), 0) / records.length).toFixed(1);

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 14, fontWeight: 700 }}>
        📊 PORTFOLIO INSIGHTS
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.4fr", gap: 16 }}>

        {/* Risk band donut */}
        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>Risk Band Mix</div>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>{records.length} assessments</div>
          <div style={{ position: "relative" }}>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={bandData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  innerRadius={48} outerRadius={72} paddingAngle={2} stroke="none">
                  {bandData.map((d) => <Cell key={d.name} fill={bandColor[d.name]} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", pointerEvents: "none",
            }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#f1f5f9" }}>{avgScore}</div>
              <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 1 }}>AVG SCORE</div>
            </div>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 6 }}>
            {bandData.map((d) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "#94a3b8" }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, background: bandColor[d.name] }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        {/* Sector-wise average score */}
        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>Average Score by Sector</div>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8 }}>Where your portfolio is strongest</div>
          <ResponsiveContainer width="100%" height={Math.max(160, sectorData.length * 30)}>
            <BarChart data={sectorData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={92} tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "#33415522" }} />
              <Bar dataKey="avg" name="Avg score" radius={[0, 6, 6, 0]} barSize={14}>
                {sectorData.map((d) => (
                  <Cell key={d.name}
                    fill={d.avg >= 75 ? "#22c55e" : d.avg >= 60 ? "#eab308" : d.avg >= 45 ? "#f97316" : "#ef4444"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
