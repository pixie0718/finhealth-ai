import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine,
} from "recharts";

const TABS = ["Revenue", "Compliance", "Stability", "Growth"];

const cardStyle = {
  background: "#0f172a", border: "1px solid #1e293b",
  borderRadius: 12, padding: "16px 20px",
};

const statLabel = { fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 4 };
const statValue = { fontSize: 22, fontWeight: 800, color: "#f1f5f9" };
const statSub = { fontSize: 11, color: "#64748b", marginTop: 2 };

const MONTH_LABELS = ["M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M11","M12","M13","M14","M15","M16","M17","M18"];

const fmtL = (v) => `₹${(v / 100000).toFixed(1)}L`;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, padding: "8px 12px", fontSize: 12 }}>
      <div style={{ color: "#64748b", marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 700 }}>
          {p.name}: {p.name.includes("Rate") || p.name.includes("%") ? `${(p.value * 100).toFixed(1)}%` : fmtL(p.value)}
        </div>
      ))}
    </div>
  );
};

function RevenueTab({ data, raw }) {
  const revenues = data.monthly_revenues || [];
  const inflows = data.monthly_inflows || [];
  const chartData = MONTH_LABELS.slice(0, revenues.length).map((m, i) => ({
    month: m,
    Revenue: Math.round(revenues[i] || 0),
    "Bank Inflow": Math.round(inflows[i] || 0),
  }));

  const avgRev = revenues.reduce((a, b) => a + b, 0) / (revenues.length || 1);
  const maxRev = Math.max(...revenues);
  const minRev = Math.min(...revenues);
  const maxMonth = MONTH_LABELS[revenues.indexOf(maxRev)];
  const minMonth = MONTH_LABELS[revenues.indexOf(minRev)];
  const growth = revenues.length >= 6
    ? ((revenues.slice(-6).reduce((a,b)=>a+b,0)/6) - (revenues.slice(0,6).reduce((a,b)=>a+b,0)/6))
      / (revenues.slice(0,6).reduce((a,b)=>a+b,0)/6) * 100
    : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "AVG MONTHLY", value: fmtL(avgRev), sub: "18-month average" },
          { label: "PEAK MONTH", value: fmtL(maxRev), sub: maxMonth },
          { label: "LOWEST MONTH", value: fmtL(minRev), sub: minMonth },
          { label: "H1 vs H2 GROWTH", value: `${growth >= 0 ? "+" : ""}${growth.toFixed(1)}%`, sub: "First 6 vs last 6 months", color: growth >= 0 ? "#22c55e" : "#ef4444" },
        ].map((s, i) => (
          <div key={i} style={cardStyle}>
            <div style={statLabel}>{s.label}</div>
            <div style={{ ...statValue, color: s.color || "#f1f5f9" }}>{s.value}</div>
            <div style={statSub}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 14 }}>MONTHLY REVENUE vs BANK INFLOW</div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtL} width={48} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Revenue" fill="#3b82f6" radius={[4,4,0,0]} />
            <Bar dataKey="Bank Inflow" fill="#22c55e" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          {[["#3b82f6","GST Revenue"],["#22c55e","Bank Inflow"]].map(([c,l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b" }}>
              <div style={{ width: 12, height: 8, background: c, borderRadius: 2 }} /> {l}
            </div>
          ))}
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 14 }}>REVENUE TREND LINE</div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtL} width={48} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={avgRev} stroke="#475569" strokeDasharray="4 4" label={{ value: "Avg", fill: "#475569", fontSize: 10 }} />
            <Line type="monotone" dataKey="Revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ComplianceTab({ raw }) {
  const gst = (raw.gst_compliance * 100).toFixed(1);
  const epfo = (raw.epfo_compliance * 100).toFixed(1);
  const combined = (raw.combined_compliance * 100).toFixed(1);
  const taxRatio = (raw.tax_to_revenue * 100).toFixed(2);

  const getColor = (v) => v >= 90 ? "#22c55e" : v >= 70 ? "#eab308" : "#ef4444";

  const meters = [
    { label: "GST Filing Compliance", value: parseFloat(gst), detail: "GSTR-1, GSTR-3B filing regularity" },
    { label: "EPFO Compliance", value: parseFloat(epfo), detail: "Provident fund contribution regularity" },
    { label: "Overall Compliance", value: parseFloat(combined), detail: "Weighted GST + EPFO score" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={cardStyle}>
          <div style={statLabel}>TAX TO REVENUE RATIO</div>
          <div style={{ ...statValue, color: "#93c5fd" }}>{taxRatio}%</div>
          <div style={statSub}>Healthy range: 12–22%</div>
        </div>
        <div style={cardStyle}>
          <div style={statLabel}>OVERALL COMPLIANCE</div>
          <div style={{ ...statValue, color: getColor(parseFloat(combined)) }}>{combined}%</div>
          <div style={statSub}>{parseFloat(combined) >= 90 ? "Excellent" : parseFloat(combined) >= 70 ? "Good" : "Needs Improvement"}</div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 20 }}>COMPLIANCE METERS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {meters.map((m) => {
            const c = getColor(m.value);
            return (
              <div key={m.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 600 }}>{m.label}</div>
                    <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{m.detail}</div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: c }}>{m.value.toFixed(1)}%</div>
                </div>
                <div style={{ background: "#1e293b", borderRadius: 6, height: 10, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${m.value}%`,
                    background: `linear-gradient(90deg, ${c}88, ${c})`,
                    borderRadius: 6, transition: "width 1s ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { label: "GST Status", value: parseFloat(gst) >= 90 ? "✓ Regular Filer" : "⚠ Needs Attention", color: parseFloat(gst) >= 90 ? "#22c55e" : "#eab308" },
          { label: "EPFO Status", value: parseFloat(epfo) >= 90 ? "✓ Compliant" : "⚠ Gaps Detected", color: parseFloat(epfo) >= 90 ? "#22c55e" : "#eab308" },
        ].map((s) => (
          <div key={s.label} style={{ ...cardStyle, textAlign: "center" }}>
            <div style={statLabel}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.color, marginTop: 6 }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StabilityTab({ raw }) {
  const revCV = (raw.revenue_cv * 100).toFixed(1);
  const buyerDiv = raw.buyer_diversity.toFixed(1);
  const salaryStab = (raw.salary_stability * 100).toFixed(1);
  const years = raw.years_in_business;
  const inflowStab = (raw.inflow_stability * 100).toFixed(1);

  const getColor = (v, invert = false) => {
    const good = invert ? v <= 20 : v >= 70;
    const ok = invert ? v <= 40 : v >= 50;
    return good ? "#22c55e" : ok ? "#eab308" : "#ef4444";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "REVENUE VOLATILITY", value: `${revCV}%`, sub: "Lower is better", color: getColor(parseFloat(revCV), true) },
          { label: "INFLOW STABILITY", value: `${inflowStab}%`, sub: "Consistency of inflows", color: getColor(parseFloat(inflowStab)) },
          { label: "SALARY STABILITY", value: `${salaryStab}%`, sub: "Payroll regularity", color: getColor(parseFloat(salaryStab)) },
        ].map((s, i) => (
          <div key={i} style={cardStyle}>
            <div style={statLabel}>{s.label}</div>
            <div style={{ ...statValue, color: s.color }}>{s.value}</div>
            <div style={statSub}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={cardStyle}>
          <div style={statLabel}>AVG UNIQUE BUYERS / MONTH</div>
          <div style={{ ...statValue, color: "#c4b5fd" }}>{parseFloat(buyerDiv).toFixed(0)}</div>
          <div style={statSub}>Higher = more diversified</div>
        </div>
        <div style={cardStyle}>
          <div style={statLabel}>YEARS IN BUSINESS</div>
          <div style={{ ...statValue, color: "#fbbf24" }}>{years} yrs</div>
          <div style={statSub}>{years >= 5 ? "Established business" : years >= 2 ? "Growing stage" : "Early stage"}</div>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 16 }}>STABILITY ASSESSMENT</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Revenue Consistency", score: Math.max(0, 100 - parseFloat(revCV)), desc: "How steady your monthly revenue is" },
            { label: "Cash Flow Stability", score: parseFloat(inflowStab), desc: "Regularity of bank inflows" },
            { label: "Payroll Regularity", score: parseFloat(salaryStab), desc: "On-time salary disbursements" },
            { label: "Customer Diversity", score: Math.min(100, parseFloat(buyerDiv) * 5), desc: "Spread across multiple buyers" },
          ].map((item) => {
            const c = item.score >= 70 ? "#22c55e" : item.score >= 50 ? "#eab308" : "#ef4444";
            return (
              <div key={item.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <div>
                    <span style={{ fontSize: 12, color: "#cbd5e1", fontWeight: 600 }}>{item.label}</span>
                    <span style={{ fontSize: 11, color: "#475569", marginLeft: 8 }}>{item.desc}</span>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: c }}>{item.score.toFixed(0)}</span>
                </div>
                <div style={{ background: "#1e293b", borderRadius: 6, height: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${item.score}%`, background: `linear-gradient(90deg, ${c}88, ${c})`, borderRadius: 6 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GrowthTab({ raw, data }) {
  const revenues = data.monthly_revenues || [];
  const empGrowth = (raw.emp_growth * 100).toFixed(1);
  const revGrowth = (raw.revenue_growth * 100).toFixed(1);
  const trendNorm = raw.revenue_trend_norm;

  const empColor = parseFloat(empGrowth) >= 0 ? "#22c55e" : "#ef4444";
  const revColor = parseFloat(revGrowth) >= 0 ? "#22c55e" : "#ef4444";

  // 3-month rolling average for trend
  const rolling = revenues.map((_, i) => {
    if (i < 2) return null;
    const avg = (revenues[i] + revenues[i-1] + revenues[i-2]) / 3;
    return { month: MONTH_LABELS[i], Trend: Math.round(avg), Revenue: Math.round(revenues[i]) };
  }).filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { label: "REVENUE GROWTH", value: `${parseFloat(revGrowth) >= 0 ? "+" : ""}${revGrowth}%`, sub: "First 6 vs last 6 months", color: revColor },
          { label: "EMPLOYEE GROWTH", value: `${parseFloat(empGrowth) >= 0 ? "+" : ""}${empGrowth}%`, sub: "Staff count change", color: empColor },
          { label: "REVENUE TREND", value: trendNorm >= 0.05 ? "↑ Upward" : trendNorm <= -0.05 ? "↓ Downward" : "→ Flat", sub: "Linear regression slope", color: trendNorm >= 0.05 ? "#22c55e" : trendNorm <= -0.05 ? "#ef4444" : "#eab308" },
        ].map((s, i) => (
          <div key={i} style={cardStyle}>
            <div style={statLabel}>{s.label}</div>
            <div style={{ ...statValue, color: s.color }}>{s.value}</div>
            <div style={statSub}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 14 }}>REVENUE vs 3-MONTH ROLLING AVERAGE</div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={rolling} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={fmtL} width={48} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="Revenue" stroke="#3b82f666" strokeWidth={1} dot={false} />
            <Line type="monotone" dataKey="Trend" stroke="#8b5cf6" strokeWidth={2.5} dot={false} strokeDasharray="0" />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          {[["#3b82f666","Monthly Revenue"],["#8b5cf6","3-Month Avg"]].map(([c,l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b" }}>
              <div style={{ width: 12, height: 2, background: c, borderRadius: 2 }} /> {l}
            </div>
          ))}
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 12 }}>GROWTH SUMMARY</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, fontSize: 13, color: "#94a3b8", lineHeight: 1.8 }}>
          <div>
            <div style={{ color: "#64748b", fontSize: 11, marginBottom: 4 }}>REVENUE TRAJECTORY</div>
            <div style={{ color: revColor, fontWeight: 600 }}>
              {parseFloat(revGrowth) >= 20 ? "Strong growth — top performer" :
               parseFloat(revGrowth) >= 5 ? "Moderate growth — healthy trend" :
               parseFloat(revGrowth) >= 0 ? "Flat — stable but not growing" :
               "Declining — needs intervention"}
            </div>
          </div>
          <div>
            <div style={{ color: "#64748b", fontSize: 11, marginBottom: 4 }}>BUSINESS EXPANSION</div>
            <div style={{ color: empColor, fontWeight: 600 }}>
              {parseFloat(empGrowth) >= 10 ? "Actively hiring — expanding" :
               parseFloat(empGrowth) >= 0 ? "Stable workforce" :
               "Workforce shrinking — watch closely"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DetailedReports({ data }) {
  const [tab, setTab] = useState("Revenue");
  const raw = data.raw_features || {};

  return (
    <div>
      <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 16 }}>DETAILED REPORTS</div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "#0f172a", borderRadius: 10, padding: 4 }}>
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
            background: tab === t ? "#1e293b" : "transparent",
            color: tab === t ? "#93c5fd" : "#475569",
            fontSize: 13, fontWeight: tab === t ? 600 : 400,
            cursor: "pointer", transition: "all 0.2s",
          }}>{t}</button>
        ))}
      </div>

      {tab === "Revenue" && <RevenueTab data={data} raw={raw} />}
      {tab === "Compliance" && <ComplianceTab raw={raw} />}
      {tab === "Stability" && <StabilityTab raw={raw} />}
      {tab === "Growth" && <GrowthTab raw={raw} data={data} />}
    </div>
  );
}
