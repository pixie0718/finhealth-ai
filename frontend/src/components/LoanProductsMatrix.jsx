import React from "react";

const PRODUCTS = [
  // Government / NTC-NTB schemes — only present in the payload for NTC/NTB businesses
  { key: "mudra_shishu",    label: "MUDRA Shishu",     icon: "🌱", desc: "Govt scheme • up to ₹50k" },
  { key: "mudra_kishore",   label: "MUDRA Kishore",    icon: "🌿", desc: "Govt scheme • up to ₹5L" },
  { key: "mudra_tarun",     label: "MUDRA Tarun",      icon: "🌳", desc: "Govt scheme • up to ₹10L" },
  { key: "cgtmse_backed",   label: "CGTMSE-Backed",    icon: "🛡️", desc: "Collateral-free • up to ₹2Cr" },
  { key: "standup_india",   label: "Stand-Up India",   icon: "🚀", desc: "First-gen entrepreneurs" },
  // Standard products
  { key: "msme_loan",       label: "MSME Loan",        icon: "🏭", desc: "MSME Special Scheme" },
  { key: "working_capital", label: "Working Capital",  icon: "⚡", desc: "Short-term liquidity" },
  { key: "business_loan",   label: "Business Loan",    icon: "💼", desc: "Long-term expansion" },
  { key: "personal_loan",   label: "Personal Loan",    icon: "👤", desc: "Owner's personal needs" },
  { key: "auto_loan",       label: "Auto Loan",        icon: "🚗", desc: "Vehicle financing" },
  { key: "home_loan",       label: "Home Loan",        icon: "🏠", desc: "Property purchase" },
];

export default function LoanProductsMatrix({ products }) {
  if (!products) return null;

  return (
    <div>
      <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 16 }}>
        LOAN PRODUCTS ELIGIBILITY MATRIX
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
        {PRODUCTS.map(({ key, label, icon, desc }) => {
          const p = products[key];
          if (!p) return null;
          const eligible = p.eligible;
          const color = eligible ? "#22c55e" : "#ef4444";
          const bg = eligible ? "#15803d11" : "#dc262611";
          const border = eligible ? "#15803d33" : "#dc262633";

          return (
            <div key={key} style={{
              background: bg,
              border: `1px solid ${border}`,
              borderRadius: 14,
              padding: "16px 18px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--c-text)" }}>{label}</div>
                    <div style={{ fontSize: 10, color: "#475569", marginTop: 1 }}>{desc}</div>
                  </div>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700,
                  color, padding: "2px 8px",
                  background: eligible ? "#15803d22" : "#dc262622",
                  borderRadius: 20,
                  border: `1px solid ${border}`,
                  whiteSpace: "nowrap",
                }}>
                  {eligible ? "✓ Eligible" : "✗ Not Eligible"}
                </div>
              </div>

              {eligible ? (
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>AMOUNT</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#22c55e" }}>
                      ₹{p.amount >= 100000
                        ? `${(p.amount / 100000).toFixed(1)}L`
                        : `${Math.round(p.amount / 1000)}K`}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>RATE</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#93c5fd" }}>{p.interest_rate}% p.a.</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "#475569", marginBottom: 2 }}>TENURE</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#c4b5fd" }}>
                      {p.tenure_months >= 12
                        ? `${p.tenure_months / 12} yrs`
                        : `${p.tenure_months} mo`}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                  Improve your score to unlock this product
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
