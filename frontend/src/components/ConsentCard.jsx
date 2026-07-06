import React, { useState, useEffect } from "react";
import { getConsent } from "../api/client";

const STATUS_COLOR = { ACTIVE:"#22c55e", REVOKED:"#ef4444", EXPIRED:"#64748b" };

export default function ConsentCard({ consentId }) {
  const [consent, setConsent] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (consentId) {
      getConsent(consentId).then(r => setConsent(r.data)).catch(() => {});
    }
  }, [consentId]);

  if (!consent) return null;

  const statusColor = STATUS_COLOR[consent.status] || "#64748b";
  const expiresDate = consent.expires_at
    ? new Date(consent.expires_at).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })
    : "—";

  return (
    <div style={{
      background:"#0d1f14", border:"1px solid #22c55e33",
      borderRadius:20, padding:"20px 24px",
    }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: open ? 16 : 0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{
            width:40, height:40, borderRadius:10,
            background:"#22c55e22", border:"1px solid #22c55e44",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
          }}>🔐</div>
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:"var(--c-text)" }}>
              AA Consent Active
            </div>
            <div style={{ fontSize:11, color:"#64748b" }}>
              {consent.consent_handle} • Expires {expiresDate}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{
            fontSize:10, padding:"3px 10px", borderRadius:20,
            background:`${statusColor}22`, border:`1px solid ${statusColor}44`,
            color:statusColor, fontWeight:700,
          }}>{consent.status}</span>
          <button onClick={() => setOpen(o => !o)} style={{
            background:"transparent", border:"1px solid var(--c-border)",
            borderRadius:8, padding:"5px 12px", color:"#64748b",
            fontSize:11, cursor:"pointer",
          }}>{open ? "Hide" : "View Artifact"}</button>
        </div>
      </div>

      {open && (
        <div>
          {/* FIU / AA */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:12 }}>
            <InfoBox label="Financial Information User" value={consent.fiu?.name} />
            <InfoBox label="Account Aggregator" value={consent.aa_operator?.name} />
            <InfoBox label="Purpose" value={consent.purpose?.text} />
            <InfoBox label="Consent Mode" value={`${consent.consent_mode} · ${consent.fetch_type}`} />
          </div>

          {/* FIP List */}
          <div style={{
            background:"var(--c-bg)", border:"1px solid var(--c-border)",
            borderRadius:12, padding:"14px 16px", marginBottom:12,
          }}>
            <div style={{ fontSize:11, color:"#475569", letterSpacing:1.5, marginBottom:10 }}>
              DATA SOURCES (FIPs)
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {(consent.fip_list || []).map((fip, i) => (
                <div key={i} style={{
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"8px 12px", background:"var(--c-surface)", borderRadius:8,
                }}>
                  <div>
                    <div style={{ fontSize:12, color:"var(--c-text)", fontWeight:600 }}>{fip.name}</div>
                    <div style={{ fontSize:10, color:"#475569" }}>{fip.id}</div>
                  </div>
                  <span style={{
                    fontSize:10, padding:"2px 8px", borderRadius:10,
                    background:"#22c55e22", border:"1px solid #22c55e33", color:"#22c55e",
                  }}>{fip.data_type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Validity */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:12 }}>
            <InfoBox label="Data Life" value={`${consent.data_life?.value} ${consent.data_life?.unit}s`} />
            <InfoBox label="Frequency" value={`Every ${consent.frequency?.value} ${consent.frequency?.unit}`} />
            <InfoBox label="Consent Types" value={(consent.consent_types || []).join(" · ")} />
          </div>

          {/* Signature */}
          <div style={{
            background:"var(--c-bg)", border:"1px solid var(--c-border)",
            borderRadius:10, padding:"10px 14px",
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <span style={{ fontSize:11, color:"#475569" }}>Digital Signature</span>
            <span style={{ fontSize:10, color:"#64748b", fontFamily:"monospace" }}>
              {consent.digital_signature}
            </span>
          </div>

          <div style={{ fontSize:10, color:"#64748b", marginTop:10, textAlign:"center" }}>
            Generated under RBI Account Aggregator Framework • Consent ID: {consentId}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div style={{ background:"var(--c-bg)", border:"1px solid var(--c-border-soft)", borderRadius:10, padding:"10px 14px" }}>
      <div style={{ fontSize:10, color:"#475569", marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:12, color:"var(--c-text)", fontWeight:600 }}>{value || "—"}</div>
    </div>
  );
}
