import React, { useEffect, useState } from "react";
import { getApplications } from "../api/client";

const statusMeta = {
  SUBMITTED:    { color: "#fbbf24", label: "Submitted",    hint: "Received by IDBI Bank — awaiting review." },
  UNDER_REVIEW: { color: "#3b82f6", label: "Under Review", hint: "A loan officer is reviewing your application." },
  APPROVED:     { color: "#22c55e", label: "Approved",     hint: "🎉 Approved! A relationship manager will contact you." },
  REJECTED:     { color: "#ef4444", label: "Rejected",     hint: "Not approved this time — improve your score and reapply." },
};

// Owner's timeline steps for the progress strip.
const FLOW = ["SUBMITTED", "UNDER_REVIEW", "APPROVED"];

export default function OwnerApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => {
    setLoading(true); setError(false);
    getApplications()
      .then((r) => setApps(r.data?.applications || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9" }}>My Loan Applications</h2>
        <p style={{ color: "#64748b", fontSize: 13, marginTop: 4 }}>Track the status of your submitted applications</p>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: "center", color: "#475569" }}>Loading…</div>
      ) : error ? (
        <div style={{ background: "#1c1010", border: "1px solid #dc262633", borderRadius: 18, padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}>⚠️</div>
          <div style={{ color: "#fca5a5", fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Couldn't reach the server</div>
          <button onClick={load} style={{ padding: "9px 22px", borderRadius: 10, border: "1px solid #ef444455", background: "#dc262611", color: "#f87171", fontWeight: 700, cursor: "pointer" }}>↻ Retry</button>
        </div>
      ) : apps.length === 0 ? (
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 20, padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
          <div style={{ color: "#f1f5f9", fontSize: 16, fontWeight: 700, marginBottom: 6 }}>No applications yet</div>
          <div style={{ color: "#64748b", fontSize: 13 }}>Check your eligibility and hit “Apply Now” to submit a loan application.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {apps.map((a) => {
            const meta = statusMeta[a.status] || statusMeta.SUBMITTED;
            const stepIdx = a.status === "REJECTED" ? -1 : FLOW.indexOf(a.status);
            return (
              <div key={a.reference} style={{ background: "#1e293b", border: `1px solid ${meta.color}44`, borderRadius: 16, padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9" }}>{a.product?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                      Ref {a.reference} • {a.interest_rate}% p.a. • {a.tenure_months} mo
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9" }}>₹{((a.loan_amount || 0) / 100000).toFixed(1)}L</div>
                    <div style={{
                      display: "inline-block", marginTop: 4,
                      fontSize: 11, fontWeight: 700, color: meta.color,
                      background: `${meta.color}18`, border: `1px solid ${meta.color}44`,
                      padding: "2px 10px", borderRadius: 20,
                    }}>{meta.label}</div>
                  </div>
                </div>

                {/* progress strip */}
                {a.status !== "REJECTED" ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    {FLOW.map((s, i) => {
                      const done = i <= stepIdx;
                      return (
                        <React.Fragment key={s}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                            <div style={{
                              width: 22, height: 22, borderRadius: "50%",
                              background: done ? statusMeta[s].color : "#0f172a",
                              border: `2px solid ${done ? statusMeta[s].color : "#334155"}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 11, color: "#0f172a", fontWeight: 900,
                            }}>{done ? "✓" : ""}</div>
                            <div style={{ fontSize: 9.5, color: done ? "#cbd5e1" : "#475569" }}>{statusMeta[s].label}</div>
                          </div>
                          {i < FLOW.length - 1 && (
                            <div style={{ flex: 1, height: 2, background: i < stepIdx ? statusMeta[FLOW[i + 1]].color : "#334155", marginBottom: 16 }} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                ) : null}

                <div style={{ fontSize: 12, color: meta.color, background: `${meta.color}11`, border: `1px solid ${meta.color}22`, borderRadius: 10, padding: "8px 12px" }}>
                  {meta.hint}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
