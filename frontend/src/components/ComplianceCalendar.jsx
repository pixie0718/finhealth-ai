import React, { useState } from "react";

const MONTHLY_EVENTS = [
  { day: 7,  name: "TDS Payment",  category: "TDS",  icon: "💸", color: "#f59e0b", desc: "Monthly TDS/TCS deducted must be remitted to government." },
  { day: 11, name: "GSTR-1",       category: "GST",  icon: "📊", color: "#3b82f6", desc: "File outward supplies return. Late fee: ₹50/day (₹20 for nil)." },
  { day: 15, name: "EPFO / PF",    category: "EPFO", icon: "👥", color: "#22c55e", desc: "Employee Provident Fund contribution due. Missed = 12% penalty." },
  { day: 15, name: "ESI Payment",  category: "EPFO", icon: "🏥", color: "#22c55e", desc: "Employee State Insurance contribution due." },
  { day: 20, name: "GSTR-3B",     category: "GST",  icon: "📋", color: "#8b5cf6", desc: "GST summary return + tax payment. Interest 18% p.a. on late payment." },
];

const QUARTERLY_EVENTS = [
  { month: 5,  day: 15, name: "Advance Tax Q1", category: "IT",   icon: "🏛️", color: "#ec4899", desc: "Pay 15% of estimated annual tax." },
  { month: 8,  day: 15, name: "Advance Tax Q2", category: "IT",   icon: "🏛️", color: "#ec4899", desc: "Pay 45% of estimated annual tax." },
  { month: 11, day: 15, name: "Advance Tax Q3", category: "IT",   icon: "🏛️", color: "#ec4899", desc: "Pay 75% of estimated annual tax." },
  { month: 2,  day: 15, name: "Advance Tax Q4", category: "IT",   icon: "🏛️", color: "#ec4899", desc: "Pay 100% of estimated annual tax." },
  { month: 11, day: 31, name: "GSTR-9 Annual",  category: "GST",  icon: "📁", color: "#3b82f6", desc: "Annual GST reconciliation return." },
];

function getUpcomingEvents(monthsAhead = 2) {
  const now = new Date();
  const events = [];

  for (let mo = 0; mo <= monthsAhead; mo++) {
    const y = now.getFullYear() + Math.floor((now.getMonth() + mo) / 12);
    const m = (now.getMonth() + mo) % 12;

    MONTHLY_EVENTS.forEach(e => {
      const d = new Date(y, m, e.day);
      if (d >= now) events.push({ ...e, date: d, id: `${e.name}-${y}-${m}` });
    });
  }

  QUARTERLY_EVENTS.forEach(e => {
    for (let yr = now.getFullYear(); yr <= now.getFullYear() + 1; yr++) {
      const d = new Date(yr, e.month, e.day);
      if (d >= now && d <= new Date(now.getFullYear() + 1, now.getMonth() + 2, 0))
        events.push({ ...e, date: d, id: `${e.name}-${yr}` });
    }
  });

  return events.sort((a, b) => a.date - b.date).slice(0, 14);
}

function urgency(date) {
  const days = Math.ceil((date - new Date()) / 86400000);
  if (days <= 3)  return { label: `${days}d left`, color: "#ef4444", bg: "#dc262618", border: "#ef444433" };
  if (days <= 7)  return { label: `${days}d left`, color: "#f97316", bg: "#ea580c18", border: "#f9731633" };
  if (days <= 14) return { label: `${days}d left`, color: "#eab308", bg: "#ca8a0418", border: "#eab30833" };
  return { label: `${days}d`,   color: "#22c55e", bg: "#15803d11", border: "#22c55e22" };
}

const CAT_COLORS = { GST: "#3b82f6", EPFO: "#22c55e", TDS: "#f59e0b", IT: "#ec4899" };

export default function ComplianceCalendar() {
  const [filter, setFilter] = useState("ALL");
  const events = getUpcomingEvents(2);
  const categories = ["ALL", "GST", "EPFO", "TDS", "IT"];

  const filtered = filter === "ALL" ? events : events.filter(e => e.category === filter);

  const grouped = filtered.reduce((acc, e) => {
    const key = e.date.toLocaleString("en-IN", { month: "long", year: "numeric" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {});

  const nextDue = events[0];
  const nextDays = nextDue ? Math.ceil((nextDue.date - new Date()) / 86400000) : null;

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px" }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>Compliance Calendar</h2>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
          Stay ahead of GST, EPFO, TDS & Income Tax deadlines
        </p>
      </div>

      {/* Alert banner */}
      {nextDue && nextDays <= 7 && (
        <div style={{
          background: "#ef444411", border: "1px solid #ef444433",
          borderRadius: 14, padding: "14px 18px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <span style={{ fontSize: 22 }}>⚠️</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fca5a5" }}>
              {nextDue.name} due in {nextDays} day{nextDays !== 1 ? "s" : ""}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{nextDue.desc}</div>
          </div>
        </div>
      )}

      {/* Summary chips */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>
        {categories.slice(1).map(cat => {
          const catEvents = events.filter(e => e.category === cat);
          const soonest = catEvents[0];
          const days = soonest ? Math.ceil((soonest.date - new Date()) / 86400000) : null;
          return (
            <div key={cat} style={{
              background: `${CAT_COLORS[cat]}11`,
              border: `1px solid ${CAT_COLORS[cat]}33`,
              borderRadius: 12, padding: "12px 14px",
            }}>
              <div style={{ fontSize: 11, color: CAT_COLORS[cat], fontWeight: 700, marginBottom: 4 }}>{cat}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>
                {catEvents.length} upcoming
              </div>
              {days !== null && (
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                  Next in {days}d
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            padding: "6px 14px", borderRadius: 20,
            background: filter === cat ? (cat === "ALL" ? "#3b82f622" : `${CAT_COLORS[cat]}22`) : "transparent",
            border: filter === cat ? `1px solid ${cat === "ALL" ? "#3b82f644" : `${CAT_COLORS[cat]}44`}` : "1px solid #334155",
            color: filter === cat ? (cat === "ALL" ? "#93c5fd" : CAT_COLORS[cat]) : "#64748b",
            fontSize: 12, fontWeight: filter === cat ? 700 : 400, cursor: "pointer",
          }}>{cat}</button>
        ))}
      </div>

      {/* Events grouped by month */}
      {Object.entries(grouped).map(([month, monthEvents]) => (
        <div key={month} style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 12 }}>{month.toUpperCase()}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {monthEvents.map(event => {
              const u = urgency(event.date);
              return (
                <div key={event.id} style={{
                  background: u.bg, border: `1px solid ${u.border}`,
                  borderRadius: 14, padding: "14px 18px",
                  display: "flex", alignItems: "center", gap: 14,
                }}>
                  {/* Date block */}
                  <div style={{
                    width: 44, flexShrink: 0, textAlign: "center",
                    background: "#0f172a", borderRadius: 10, padding: "8px 6px",
                    border: `1px solid ${event.color}33`,
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: event.color, lineHeight: 1 }}>
                      {event.date.getDate()}
                    </div>
                    <div style={{ fontSize: 9, color: "#475569", marginTop: 2, letterSpacing: 0.5 }}>
                      {event.date.toLocaleString("en-IN", { month: "short" }).toUpperCase()}
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 14 }}>{event.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{event.name}</span>
                      <span style={{
                        fontSize: 10, padding: "1px 8px", borderRadius: 10,
                        background: `${event.color}22`, color: event.color,
                        fontWeight: 700,
                      }}>{event.category}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{event.desc}</div>
                  </div>

                  {/* Urgency badge */}
                  <div style={{
                    padding: "4px 10px", borderRadius: 20, flexShrink: 0,
                    background: u.bg, border: `1px solid ${u.border}`,
                    fontSize: 11, fontWeight: 700, color: u.color,
                  }}>{u.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
