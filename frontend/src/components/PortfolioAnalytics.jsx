import React from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import useIsMobile from "../hooks/useIsMobile";

const BANDS = ["LOW", "MEDIUM-LOW", "MEDIUM", "HIGH"];
const bandColor = { LOW: "#22c55e", "MEDIUM-LOW": "#eab308", MEDIUM: "#f97316", HIGH: "#ef4444" };

const card = {
  background: "var(--c-surface)", border: "1px solid var(--c-border)",
  borderRadius: 16, padding: "18px 20px",
};

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--c-bg)", border: "1px solid var(--c-border)", borderRadius: 10, padding: "8px 12px", fontSize: 12 }}>
      <div style={{ color: "var(--c-text)", fontWeight: 700 }}>{label ?? payload[0].name}</div>
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

  // Geographic (city-wise) distribution — count + avg score
  const cities = {};
  records.forEach((r) => {
    const c = r.city || "Other";
    (cities[c] = cities[c] || []).push(r.pillar_scores?.overall ?? 0);
  });
  const cityData = Object.entries(cities)
    .map(([name, arr]) => ({ name, count: arr.length, avg: +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
  const maxCityCount = Math.max(...cityData.map((c) => c.count), 1);

  // Risk heatmap — top sectors × risk bands (cell = count)
  const topSectors = sectorData.map((s) => s.name).slice(0, 6);
  const heat = topSectors.map((sec) => ({
    sector: sec,
    cells: BANDS.map((band) => ({
      band,
      count: records.filter((r) => (r.business_type || "Other") === sec && r.loan_eligibility?.risk_band === band).length,
    })),
  }));
  const maxHeat = Math.max(1, ...heat.flatMap((h) => h.cells.map((c) => c.count)));

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 14, fontWeight: 700 }}>
        📊 PORTFOLIO INSIGHTS
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.4fr", gap: 16 }}>

        {/* Risk band donut */}
        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--c-text)", marginBottom: 4 }}>Risk Band Mix</div>
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
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--c-text)" }}>{avgScore}</div>
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
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--c-text)", marginBottom: 4 }}>Average Score by Sector</div>
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

      {/* Second row: risk heatmap + geographic distribution */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.5fr 1fr", gap: 16, marginTop: 16 }}>

        {/* Risk heatmap: sector × risk band */}
        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--c-text)", marginBottom: 4 }}>Risk Heatmap</div>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>Applications by sector &amp; risk band</div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 4, minWidth: 340 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", fontSize: 10, color: "#64748b", fontWeight: 600, padding: "2px 6px" }}></th>
                  {BANDS.map((b) => (
                    <th key={b} style={{ fontSize: 9.5, color: bandColor[b], fontWeight: 700, padding: "2px 4px", textAlign: "center" }}>{b}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heat.map((row) => (
                  <tr key={row.sector}>
                    <td style={{ fontSize: 11, color: "#cbd5e1", padding: "2px 6px", whiteSpace: "nowrap" }}>{row.sector}</td>
                    {row.cells.map((c) => {
                      const intensity = c.count / maxHeat;
                      return (
                        <td key={c.band} style={{ padding: 0 }}>
                          <div title={`${row.sector} · ${c.band}: ${c.count}`} style={{
                            height: 34, borderRadius: 6,
                            background: c.count ? `${bandColor[c.band]}${Math.round(20 + intensity * 200).toString(16).padStart(2, "0")}` : "var(--c-bg)",
                            border: `1px solid ${c.count ? bandColor[c.band] + "55" : "var(--c-surface)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, color: c.count ? "#fff" : "#64748b",
                          }}>{c.count || ""}</div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Geographic distribution */}
        <div style={card}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--c-text)", marginBottom: 4 }}>Geographic Spread</div>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>Applications by city</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {cityData.map((c) => (
              <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 78, fontSize: 11.5, color: "#94a3b8", whiteSpace: "nowrap" }}>📍 {c.name}</div>
                <div style={{ flex: 1, height: 18, background: "var(--c-bg)", borderRadius: 5, overflow: "hidden", position: "relative" }}>
                  <div style={{ width: `${(c.count / maxCityCount) * 100}%`, height: "100%", background: "linear-gradient(90deg, #3b82f6, #8b5cf6)", borderRadius: 5 }} />
                  <span style={{ position: "absolute", right: 8, top: 0, lineHeight: "18px", fontSize: 10.5, color: "#cbd5e1", fontWeight: 700 }}>{c.count} · avg {c.avg}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
