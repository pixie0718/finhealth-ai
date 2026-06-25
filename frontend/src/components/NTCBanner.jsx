import React, { useState } from "react";

const MUDRA_TIERS = [
  { name:"Shishu",  amount:"up to ₹50,000",  desc:"First-time micro-enterprise loan",         color:"#22c55e" },
  { name:"Kishore", amount:"₹50K – ₹5 Lakh", desc:"Growth-stage with 6m track record",        color:"#3b82f6" },
  { name:"Tarun",   amount:"₹5L – ₹10 Lakh", desc:"Established micro-enterprise expansion",   color:"#8b5cf6" },
];

export default function NTCBanner({ ntcFlag, ntbFlag, overallScore }) {
  const [expanded, setExpanded] = useState(false);
  if (!ntcFlag && !ntbFlag) return null;

  const isNTC = ntcFlag;
  const isNTB = ntbFlag;

  return (
    <div style={{
      background:"linear-gradient(135deg, #0d2618, #0a1a2e)",
      border:"1px solid #22c55e44",
      borderRadius:20, padding:"20px 24px", marginBottom:16,
    }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:14 }}>
        <div style={{
          width:44, height:44, borderRadius:12,
          background:"#22c55e22", border:"1px solid #22c55e44",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:22, flexShrink:0,
        }}>🌱</div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:6 }}>
            {isNTC && (
              <span style={{
                fontSize:10, padding:"2px 10px", borderRadius:20,
                background:"#22c55e22", border:"1px solid #22c55e44",
                color:"#22c55e", fontWeight:800, letterSpacing:1,
              }}>NTC — NEW TO CREDIT</span>
            )}
            {isNTB && (
              <span style={{
                fontSize:10, padding:"2px 10px", borderRadius:20,
                background:"#3b82f622", border:"1px solid #3b82f644",
                color:"#3b82f6", fontWeight:800, letterSpacing:1,
              }}>NTB — NEW TO BANK</span>
            )}
          </div>
          <div style={{ fontSize:16, fontWeight:700, color:"#f1f5f9", marginBottom:4 }}>
            {isNTC ? "No Credit History Detected — You Still Qualify" : "New Business — Special Products Available"}
          </div>
          <div style={{ fontSize:13, color:"#86efac", lineHeight:1.6 }}>
            {isNTC
              ? "Traditional banks reject NTC businesses. Our alternate data assessment (GST + UPI + EPFO) scores you independently of CIBIL. You're scored on 4 pillars instead of 5, with credit pillar weight redistributed to your actual financial behavior."
              : "New businesses often lack the credit history required by traditional lenders. MUDRA, CGTMSE, and Stand-Up India schemes are available specifically for you."}
          </div>
        </div>
      </div>

      {/* NTC scoring explanation */}
      {isNTC && (
        <div style={{
          background:"#0f172a", border:"1px solid #334155",
          borderRadius:12, padding:"14px 16px", marginBottom:14,
        }}>
          <div style={{ fontSize:11, color:"#475569", letterSpacing:1.5, marginBottom:10 }}>
            HOW YOUR SCORE WAS CALCULATED (NTC MODE)
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {[
              { pillar:"Cash Flow",  weight:"30%", icon:"💧", note:"↑ from 25%" },
              { pillar:"Compliance", weight:"24%", icon:"📋", note:"↑ from 20%" },
              { pillar:"Growth",     weight:"23%", icon:"📈", note:"↑ from 20%" },
              { pillar:"Stability",  weight:"23%", icon:"🏛️", note:"↑ from 20%" },
            ].map(p => (
              <div key={p.pillar} style={{
                display:"flex", alignItems:"center", gap:8,
                padding:"8px 10px", background:"#1e293b", borderRadius:8,
              }}>
                <span style={{ fontSize:16 }}>{p.icon}</span>
                <div>
                  <div style={{ fontSize:12, color:"#f1f5f9", fontWeight:600 }}>{p.pillar}</div>
                  <div style={{ fontSize:10, color:"#22c55e" }}>{p.weight} <span style={{ color:"#475569" }}>{p.note}</span></div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:10, fontSize:11, color:"#475569" }}>
            Credit pillar (15%) suppressed — its weight redistributed to alternate data pillars.
            This gives you a fair score based on your actual financial behavior.
          </div>
        </div>
      )}

      {/* MUDRA tiers */}
      <button onClick={() => setExpanded(e => !e)} style={{
        background:"transparent", border:"1px solid #22c55e44",
        borderRadius:10, padding:"8px 16px", color:"#22c55e",
        fontSize:12, cursor:"pointer", fontWeight:600,
        display:"flex", alignItems:"center", gap:6,
      }}>
        {expanded ? "▲" : "▼"} Government Schemes Available for Your Business
      </button>

      {expanded && (
        <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
          {[
            { icon:"🏛️", name:"MUDRA Loans",         color:"#22c55e",
              desc:"No collateral. PMMY scheme for micro & small enterprises.",
              tiers: MUDRA_TIERS },
            { icon:"🛡️", name:"CGTMSE Guarantee",    color:"#3b82f6",
              desc:"Credit Guarantee Fund Trust — banks lend without collateral under this scheme.",
              limit:"Up to ₹2 Crore" },
            { icon:"⭐", name:"Stand-Up India",        color:"#f59e0b",
              desc:"Bank loans for first-generation entrepreneurs.",
              limit:"₹10L – ₹1 Crore" },
            { icon:"🤝", name:"Co-Lending Model",     color:"#8b5cf6",
              desc:"IDBI Bank + NBFC co-origination for MSMEs underserved by traditional credit.",
              limit:"Based on assessment" },
          ].map(scheme => (
            <div key={scheme.name} style={{
              background:"#0f172a", border:`1px solid ${scheme.color}22`,
              borderRadius:12, padding:"14px 16px",
            }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                <span style={{ fontSize:18 }}>{scheme.icon}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#f1f5f9" }}>{scheme.name}</div>
                  <div style={{ fontSize:11, color:"#64748b" }}>{scheme.desc}</div>
                </div>
                {scheme.limit && (
                  <div style={{ fontSize:11, color:scheme.color, fontWeight:700, textAlign:"right" }}>
                    {scheme.limit}
                  </div>
                )}
              </div>
              {scheme.tiers && (
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:6 }}>
                  {scheme.tiers.map(t => (
                    <div key={t.name} style={{
                      padding:"5px 10px", borderRadius:8, fontSize:11,
                      background:`${t.color}11`, border:`1px solid ${t.color}33`, color:t.color,
                    }}>
                      <strong>{t.name}</strong>: {t.amount}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div style={{ fontSize:11, color:"#475569", marginTop:4 }}>
            💡 Tip: Apply for MUDRA Shishu first → repay on time → CIBIL record established → upgrade to Kishore in 6 months.
          </div>
        </div>
      )}
    </div>
  );
}
