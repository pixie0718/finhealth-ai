import React from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const MONTH_LABELS = ["M1","M2","M3","M4","M5","M6","M7","M8","M9","M10","M11","M12","M13","M14","M15","M16","M17","M18"];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    return (
      <div style={{
        background: "#0f172a", border: "1px solid #334155",
        borderRadius: 8, padding: "8px 12px", fontSize: 12,
      }}>
        <div style={{ color: "#64748b", marginBottom: 2 }}>{payload[0].payload.month}</div>
        <div style={{ color: "#93c5fd", fontWeight: 700 }}>₹{(val / 100000).toFixed(1)}L</div>
      </div>
    );
  }
  return null;
};

export default function RevenueChart({ revenues, inflows }) {
  const data = MONTH_LABELS.slice(0, (revenues || []).length).map((m, i) => ({
    month: m,
    revenue: Math.round(revenues[i] || 0),
    inflow: Math.round((inflows || [])[i] || 0),
  }));

  return (
    <div>
      <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 16 }}>
        18-MONTH REVENUE TREND
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="infGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="month" tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#475569", fontSize: 10 }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} width={44} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2}
            fill="url(#revGrad)" name="GST Revenue" />
          {inflows && (
            <Area type="monotone" dataKey="inflow" stroke="#22c55e" strokeWidth={2}
              fill="url(#infGrad)" name="Bank Inflow" />
          )}
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b" }}>
          <div style={{ width: 12, height: 2, background: "#3b82f6", borderRadius: 2 }} /> GST Revenue
        </div>
        {inflows && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#64748b" }}>
            <div style={{ width: 12, height: 2, background: "#22c55e", borderRadius: 2 }} /> Bank Inflow
          </div>
        )}
      </div>
    </div>
  );
}
