import React, { useEffect, useState } from "react";
import { getApplications, setApplicationStatus, getScore } from "../api/client";
import useIsMobile from "../hooks/useIsMobile";

const statusMeta = {
  SUBMITTED:    { color: "#fbbf24", label: "Submitted" },
  UNDER_REVIEW: { color: "#3b82f6", label: "Under Review" },
  APPROVED:     { color: "#22c55e", label: "Approved" },
  REJECTED:     { color: "#ef4444", label: "Rejected" },
};

const FILTERS = ["ALL", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"];

const productLabel = (p) => (p || "—").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

export default function ManagerApplications({ onView }) {
  const isMobile = useIsMobile();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(null); // reference currently being updated

  const load = () => {
    setLoading(true); setError(false);
    getApplications()
      .then((r) => setApps(r.data?.applications || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "ALL" ? apps.length : apps.filter(a => a.status === f).length;
    return acc;
  }, {});

  const visible = apps
    .filter(a => filter === "ALL" || a.status === filter)
    .filter(a => !search.trim() || (a.business_name || "").toLowerCase().includes(search.trim().toLowerCase()) || (a.reference || "").toLowerCase().includes(search.trim().toLowerCase()));

  const updateApp = async (reference, status) => {
    setBusy(reference);
    setApps((prev) => prev.map((a) => (a.reference === reference ? { ...a, status } : a)));
    try {
      await setApplicationStatus(reference, status);
    } catch {
      alert("Couldn't update application status.");
      load();
    } finally {
      setBusy(null);
    }
  };

  const emptyRecord = (a) => ({
    _appRef: a.reference, _appData: a, business_name: a.business_name,
    pillar_scores: { cash_flow: 0, compliance: 0, growth: 0, stability: 0, credit_worthiness: 0, overall: 0 },
    loan_eligibility: { eligible_loan_amount: 0, risk_band: "UNKNOWN" },
    ml_prediction: {}, explanations: { strengths: [], risks: [], top_drivers: [] },
    monthly_revenues: [], monthly_inflows: [], recommendations: [],
  });

  const viewApplication = async (a) => {
    try {
      const res = await getScore(a.msme_id);
      onView({ ...res.data, _appRef: a.reference, _appData: a });
    } catch {
      onView(emptyRecord(a));
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "20px 16px" : "32px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--c-text)" }}>Loan Applications</h2>
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>
            All applications submitted to IDBI Bank • {apps.length} total
          </p>
        </div>
        <button onClick={load} style={{
          background: "transparent", border: "1px solid var(--c-border)", color: "#94a3b8",
          borderRadius: 8, padding: "7px 14px", fontSize: 12, cursor: "pointer",
        }}>↻ Refresh</button>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {FILTERS.map((f) => {
          const active = filter === f;
          const color = f === "ALL" ? "#3b82f6" : statusMeta[f].color;
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: "7px 16px", borderRadius: 20,
              background: active ? `${color}22` : "var(--c-surface)",
              border: active ? `1px solid ${color}66` : "1px solid var(--c-border)",
              color: active ? color : "#94a3b8",
              fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              {f === "ALL" ? "All" : statusMeta[f].label}
              <span style={{
                fontSize: 10, padding: "1px 7px", borderRadius: 10,
                background: active ? `${color}33` : "var(--c-surface-2)",
                color: active ? color : "#64748b",
              }}>{counts[f]}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by business name or reference…"
        style={{
          width: "100%", boxSizing: "border-box", marginBottom: 20,
          background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 10,
          padding: "10px 14px", color: "var(--c-text)", fontSize: 13, outline: "none",
        }}
      />

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "#475569" }}>Loading…</div>
      ) : error ? (
        <div style={{ background: "#1c1010", border: "1px solid #dc262633", borderRadius: 18, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}>⚠️</div>
          <div style={{ color: "#fca5a5", fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Couldn't reach the server</div>
          <button onClick={load} style={{ padding: "9px 22px", borderRadius: 10, border: "1px solid #ef444455", background: "#dc262611", color: "#f87171", fontWeight: 700, cursor: "pointer" }}>↻ Retry</button>
        </div>
      ) : visible.length === 0 ? (
        <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 20, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
          <div style={{ color: "var(--c-text)", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
            {apps.length === 0 ? "No applications yet" : "No applications match this filter"}
          </div>
          <div style={{ color: "#64748b", fontSize: 13 }}>
            {apps.length === 0 ? "Incoming loan applications will show up here." : "Try a different status filter or clear your search."}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visible.map((a) => {
            const meta = statusMeta[a.status] || statusMeta.SUBMITTED;
            const pending = a.status === "SUBMITTED" || a.status === "UNDER_REVIEW";
            return (
              <div key={a.reference} style={{
                background: "var(--c-surface)", border: `1px solid ${meta.color}33`,
                borderRadius: 14, padding: "16px 18px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                flexWrap: "wrap", gap: 12,
              }}>
                <div style={{ minWidth: 180, flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--c-text)" }}>{a.business_name || "—"}</div>
                  <div style={{ fontSize: 11.5, color: "#64748b", marginTop: 2 }}>
                    {a.reference} • {productLabel(a.product)} • {a.created_at ? new Date(a.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                  </div>
                </div>

                <div style={{ textAlign: "right", minWidth: 90 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#93c5fd" }}>₹{((a.loan_amount || 0) / 100000).toFixed(1)}L</div>
                  {a.score != null && <div style={{ fontSize: 10.5, color: "#64748b" }}>Score {Math.round(a.score)}</div>}
                </div>

                <div style={{
                  fontSize: 10.5, fontWeight: 700, color: meta.color,
                  background: `${meta.color}18`, border: `1px solid ${meta.color}44`,
                  padding: "4px 12px", borderRadius: 20, whiteSpace: "nowrap",
                }}>{meta.label}</div>

                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => viewApplication(a)} style={{
                    fontSize: 11, fontWeight: 700, cursor: "pointer",
                    color: "#3b82f6", background: "#3b82f622", border: "1px solid #3b82f655",
                    padding: "6px 12px", borderRadius: 8,
                  }}>📊 Details</button>
                  {pending && (
                    <>
                      <button disabled={busy === a.reference} onClick={() => updateApp(a.reference, "APPROVED")} style={{
                        fontSize: 11, fontWeight: 700, cursor: busy === a.reference ? "not-allowed" : "pointer",
                        color: "#22c55e", background: "#15803d22", border: "1px solid #15803d55",
                        padding: "6px 12px", borderRadius: 8,
                      }}>✓ Approve</button>
                      <button disabled={busy === a.reference} onClick={() => updateApp(a.reference, "REJECTED")} style={{
                        fontSize: 11, fontWeight: 700, cursor: busy === a.reference ? "not-allowed" : "pointer",
                        color: "#f87171", background: "#dc262611", border: "1px solid #dc262655",
                        padding: "6px 12px", borderRadius: 8,
                      }}>✕ Reject</button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
