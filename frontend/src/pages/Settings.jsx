import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import useIsMobile from "../hooks/useIsMobile";

const DATA_SOURCES = [
  { icon: "📊", name: "GST Portal", desc: "Revenue & compliance data", color: "#3b82f6", status: "Connected" },
  { icon: "🏦", name: "Account Aggregator (AA)", desc: "Bank statements via RBI AA", color: "#8b5cf6", status: "Connected" },
  { icon: "📱", name: "UPI / NPCI", desc: "Transaction patterns (18 months)", color: "#06b6d4", status: "Connected" },
  { icon: "👥", name: "EPFO Records", desc: "Employee & salary data", color: "#22c55e", status: "Connected" },
  { icon: "💳", name: "Credit Bureau (CIBIL)", desc: "Credit history & score", color: "#ec4899", status: "Connected" },
  { icon: "🏢", name: "MCA / ROC", desc: "Company registration", color: "#f59e0b", status: "Optional" },
];

const CONSENT_ITEMS = [
  "GST filing & revenue data from GSTN Portal",
  "Bank account statements via AA Framework",
  "UPI transaction patterns from NPCI",
  "Employee data from EPFO records",
  "Credit history from CIBIL / Equifax",
];

const sectionTitle = { fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 14 };
const card = { background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: "20px 24px", marginBottom: 16 };

export default function Settings() {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const [consents, setConsents] = useState(CONSENT_ITEMS.map((text) => ({ text, status: "ACTIVE" })));
  const anyActive = consents.some((c) => c.status === "ACTIVE");

  const toggleConsent = (i) => {
    setConsents((cs) => cs.map((c, idx) => {
      if (idx !== i) return c;
      if (c.status === "ACTIVE" && !window.confirm(`Revoke consent for:\n\n${c.text}?`)) return c;
      return { ...c, status: c.status === "ACTIVE" ? "REVOKED" : "ACTIVE" };
    }));
  };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>Profile & Settings</h2>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Manage your account and data access</p>
      </div>

      {/* Profile Card */}
      <div style={sectionTitle}>ACCOUNT PROFILE</div>
      <div style={card}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: user?.role === "banker"
              ? "linear-gradient(135deg, #8b5cf6, #6d28d9)"
              : "linear-gradient(135deg, #3b82f6, #1d4ed8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28,
          }}>
            {user?.role === "banker" ? "🏦" : "🏭"}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9" }}>{user?.full_name || "User"}</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>{user?.email}</div>
            <div style={{
              marginTop: 6, display: "inline-block",
              padding: "2px 12px", borderRadius: 20,
              background: user?.role === "banker" ? "#8b5cf622" : "#3b82f622",
              border: user?.role === "banker" ? "1px solid #8b5cf644" : "1px solid #3b82f644",
              fontSize: 11, fontWeight: 700,
              color: user?.role === "banker" ? "#c4b5fd" : "#93c5fd",
            }}>
              {user?.role === "banker" ? "Bank Officer" : "Business Owner"}
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
          {[
            { label: "EMAIL", value: user?.email },
            { label: "ROLE", value: user?.role === "banker" ? "Bank Officer — IDBI" : "Business Owner — MSME" },
            { label: "ACCOUNT ID", value: `USR-${String(user?.id || 0).padStart(5, "0")}` },
            { label: "SESSION", value: "Active (24hr JWT)" },
          ].map((f) => (
            <div key={f.label} style={{ background: "#0f172a", borderRadius: 10, padding: "10px 14px" }}>
              <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1, marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 500 }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sources — status follows the consent toggles below */}
      <div style={sectionTitle}>CONNECTED DATA SOURCES</div>
      <div style={{ ...card, padding: "16px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
          {DATA_SOURCES.map((ds, i) => {
            // First 5 sources are governed by the 5 consent items; MCA stays "Optional".
            const status = ds.status === "Optional"
              ? "Optional"
              : (consents[i] && consents[i].status === "ACTIVE" ? "Connected" : "Revoked");
            ds = { ...ds, status };
            return (
            <div key={ds.name} style={{
              background: "#0f172a",
              border: `1px solid ${ds.color}22`,
              borderRadius: 12, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{ds.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: ds.color }}>{ds.name}</div>
                <div style={{ fontSize: 10, color: "#475569", marginTop: 1 }}>{ds.desc}</div>
              </div>
              <div style={{
                fontSize: 10, fontWeight: 700, flexShrink: 0, whiteSpace: "nowrap",
                color: ds.status === "Connected" ? "#22c55e" : "#64748b",
                padding: "2px 8px", borderRadius: 20,
                background: ds.status === "Connected" ? "#15803d22" : "#1e293b",
                border: ds.status === "Connected" ? "1px solid #15803d33" : "1px solid #334155",
              }}>
                {ds.status === "Connected" ? "✓" : "–"} {ds.status}
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Consent */}
      <div style={sectionTitle}>CONSENT & DATA SHARING</div>
      <div style={card}>
        <div style={{
          background: anyActive ? "#15803d11" : "#dc262611",
          border: anyActive ? "1px solid #15803d33" : "1px solid #dc262633",
          borderRadius: 10, padding: "12px 16px", marginBottom: 16,
          fontSize: 12, color: anyActive ? "#86efac" : "#fca5a5",
        }}>
          {anyActive
            ? "🔒 Active consent — valid for 90 days from last assessment. Revoke anytime below."
            : "⚠ All consents revoked. New assessments can't fetch data until you re-grant access."}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {consents.map((c, i) => {
            const active = c.status === "ACTIVE";
            return (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", background: "#0f172a", borderRadius: 10,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: active ? "#22c55e" : "#64748b", fontSize: 13 }}>{active ? "✓" : "✕"}</span>
                  <span style={{ fontSize: 13, color: active ? "#94a3b8" : "#475569", textDecoration: active ? "none" : "line-through" }}>{c.text}</span>
                </div>
                <button onClick={() => toggleConsent(i)} style={{
                  fontSize: 10, fontWeight: 700, cursor: "pointer",
                  color: active ? "#f87171" : "#22c55e",
                  background: active ? "#dc262611" : "#15803d22",
                  padding: "3px 10px", borderRadius: 20,
                  border: active ? "1px solid #dc262633" : "1px solid #15803d33",
                }}>
                  {active ? "Revoke" : "Re-grant"}
                </button>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: "#475569", padding: "10px 14px", background: "#0f172a", borderRadius: 10 }}>
          📋 Consent valid for 90 days • Data used only for credit assessment • No third-party sharing
        </div>
      </div>

      {/* Privacy Policy */}
      <div style={sectionTitle}>PRIVACY & LEGAL</div>
      <div style={card}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { icon: "📄", label: "Privacy Policy", desc: "How we handle your data" },
            { icon: "📋", label: "Terms & Conditions", desc: "Usage terms for FinHealth AI" },
            { icon: "🛡️", label: "RBI AA Compliance", desc: "We follow all RBI Account Aggregator guidelines" },
            { icon: "🔐", label: "Data Security", desc: "256-bit encryption, no data sold to third parties" },
          ].map((item) => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "10px 14px", background: "#0f172a", borderRadius: 10,
            }}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button onClick={logout} style={{
        width: "100%", padding: "14px",
        background: "#dc262611", border: "1px solid #dc262633",
        borderRadius: 14, color: "#ef4444",
        fontSize: 14, fontWeight: 700, cursor: "pointer",
        marginTop: 8, transition: "background 0.2s",
      }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#dc262622"}
        onMouseLeave={(e) => e.currentTarget.style.background = "#dc262611"}
      >
        Sign Out
      </button>
    </div>
  );
}
