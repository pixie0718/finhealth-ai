import React, { useState, useMemo } from "react";
import useIsMobile from "../hooks/useIsMobile";

function calcEMI(principal, annualRate, months) {
  if (!principal || !months) return 0;
  const r = annualRate / 12 / 100;
  if (r === 0) return principal / months;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

const PRODUCT_LABELS = {
  msme_loan:       "MSME Loan",
  working_capital: "Working Capital",
  business_loan:   "Business Loan",
  personal_loan:   "Personal Loan",
  auto_loan:       "Auto Loan",
  home_loan:       "Home Loan",
  // NTC / MUDRA products
  mudra_shishu:    "MUDRA Shishu",
  mudra_kishore:   "MUDRA Kishore",
  mudra_tarun:     "MUDRA Tarun",
  cgtmse_backed:   "CGTMSE-Backed",
  standup_india:   "Stand-Up India",
};

const PRODUCT_ICONS = {
  msme_loan:       "🏭",
  working_capital: "💧",
  business_loan:   "💼",
  personal_loan:   "👤",
  auto_loan:       "🚗",
  home_loan:       "🏠",
  // NTC / MUDRA products
  mudra_shishu:    "🌱",
  mudra_kishore:   "🌿",
  mudra_tarun:     "🌳",
  cgtmse_backed:   "🛡️",
  standup_india:   "⭐",
};

export default function EMICalculator({ products, defaultProduct = "msme_loan" }) {
  const isMobile = useIsMobile();
  const eligible = Object.entries(products || {}).filter(([, p]) => p.eligible);

  const [selected, setSelected] = useState(() => {
    const first = eligible.find(([k]) => k === defaultProduct) || eligible[0];
    return first ? first[0] : null;
  });

  const product = selected ? products[selected] : null;

  const [amount, setAmount] = useState(() => product?.amount || 0);
  const [rate, setRate] = useState(() => product?.interest_rate || 12);
  const [tenure, setTenure] = useState(() => product?.tenure_months || 60);

  const emi = useMemo(() => calcEMI(amount, rate, tenure), [amount, rate, tenure]);
  const totalPayment = emi * tenure;
  const totalInterest = totalPayment - amount;

  const selectProduct = (key) => {
    setSelected(key);
    const p = products[key];
    setAmount(p.amount);
    setRate(p.interest_rate);
    setTenure(p.tenure_months);
  };

  if (!eligible.length) return null;

  const fmtL = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${Math.round(v).toLocaleString("en-IN")}`;

  return (
    <div>
      <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 16 }}>EMI CALCULATOR</div>

      {/* Product selector */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {eligible.map(([key]) => (
          <button key={key} onClick={() => selectProduct(key)} style={{
            padding: "6px 14px",
            background: selected === key ? "#3b82f622" : "transparent",
            border: selected === key ? "1px solid #3b82f644" : "1px solid #334155",
            borderRadius: 20, color: selected === key ? "#93c5fd" : "#64748b",
            fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
          }}>
            <span>{PRODUCT_ICONS[key]}</span> {PRODUCT_LABELS[key]}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 20 }}>

        {/* Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {[
            {
              label: "Loan Amount", value: amount, min: 10000,
              max: product?.amount ? product.amount * 1.5 : 5000000,
              step: 10000,
              format: v => fmtL(v),
              onChange: v => setAmount(v),
            },
            {
              label: "Interest Rate (% p.a.)", value: rate, min: 6, max: 24, step: 0.25,
              format: v => `${v.toFixed(2)}%`,
              onChange: v => setRate(v),
            },
            {
              label: "Tenure", value: tenure, min: 6,
              max: product?.tenure_months || 60,
              step: 1,
              format: v => v >= 12 ? `${(v / 12).toFixed(1)} yrs` : `${v} mo`,
              onChange: v => setTenure(v),
            },
          ].map(({ label, value, min, max, step, format, onChange }) => (
            <div key={label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{format(value)}</span>
              </div>
              <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                style={{ width: "100%", accentColor: "#3b82f6", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#334155", marginTop: 2 }}>
                <span>{format(min)}</span><span>{format(max)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Output */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{
            background: "linear-gradient(135deg, #3b82f611, #8b5cf611)",
            border: "1px solid #3b82f633",
            borderRadius: 16, padding: "22px 20px", textAlign: "center",
          }}>
            <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginBottom: 8 }}>MONTHLY EMI</div>
            <div style={{ fontSize: 40, fontWeight: 900, color: "#93c5fd", lineHeight: 1 }}>
              {fmtL(Math.round(emi))}
            </div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 6 }}>per month for {tenure} months</div>
          </div>

          {[
            { label: "Principal Amount", value: fmtL(amount), color: "#3b82f6" },
            { label: "Total Interest", value: fmtL(Math.round(totalInterest)), color: "#f59e0b" },
            { label: "Total Payment", value: fmtL(Math.round(totalPayment)), color: "#f1f5f9" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              background: "#0f172a", border: "1px solid #1e293b",
              borderRadius: 10, padding: "12px 16px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
            </div>
          ))}

          {/* Interest ratio bar */}
          <div style={{ marginTop: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#475569", marginBottom: 4 }}>
              <span>Principal</span><span>Interest</span>
            </div>
            <div style={{ height: 8, background: "#1e293b", borderRadius: 4, overflow: "hidden", display: "flex" }}>
              <div style={{
                width: `${(amount / totalPayment) * 100}%`,
                background: "#3b82f6", transition: "width 0.3s",
              }} />
              <div style={{ flex: 1, background: "#f59e0b" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
