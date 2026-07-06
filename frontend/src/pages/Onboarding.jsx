import React, { useState } from "react";
import { generateScore } from "../api/client";

const BUSINESS_TYPES = ["Textile", "Pharma", "Electronics", "Food Processing", "Retail", "Construction", "IT Services", "Logistics"];
const CITIES = ["Mumbai", "Delhi", "Surat", "Ahmedabad", "Pune", "Bangalore", "Chennai", "Hyderabad", "Kolkata", "Jaipur"];

const steps = ["Business Details", "Data Sources", "Consent & Submit"];

const inputStyle = {
  width: "100%",
  background: "var(--c-bg)",
  border: "1px solid var(--c-border)",
  borderRadius: 10,
  padding: "12px 16px",
  color: "var(--c-text)",
  fontSize: 14,
  outline: "none",
};

const labelStyle = {
  fontSize: 12,
  color: "#64748b",
  marginBottom: 6,
  display: "block",
  letterSpacing: 0.5,
};

export default function Onboarding({ onResult }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    gstin: "",
    business_type: "Textile",
    city: "Mumbai",
    years_in_business: 3,
    consent_given: false,
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await generateScore({ ...form, consent_given: true });
      onResult(res.data);
    } catch (e) {
      alert("Error generating score. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const dataSources = [
    { icon: "📊", name: "GST Portal", desc: "Revenue, tax compliance, buyer data", color: "#3b82f6" },
    { icon: "🏦", name: "Account Aggregator (AA)", desc: "Real-time bank statements via RBI AA", color: "#8b5cf6" },
    { icon: "📱", name: "UPI Transaction Data", desc: "Cash flow patterns, receivables", color: "#06b6d4" },
    { icon: "👥", name: "EPFO Records", desc: "Employee count, salary, compliance", color: "#22c55e" },
    { icon: "🏢", name: "MCA / ROC", desc: "Company registration, filings", color: "#f59e0b" },
    { icon: "📈", name: "Credit Bureau", desc: "CIBIL / Equifax credit history", color: "#ec4899" },
  ];

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 16px" }}>

      {/* Progress */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: i <= step ? "#3b82f6" : "var(--c-surface)",
              border: `2px solid ${i <= step ? "#3b82f6" : "#64748b"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: i <= step ? "#fff" : "#475569",
              transition: "all 0.3s",
            }}>{i + 1}</div>
            <div style={{ fontSize: 11, color: i <= step ? "#94a3b8" : "#475569" }}>{s}</div>
            {i < steps.length - 1 && (
              <div style={{
                position: "absolute", display: "none",
              }} />
            )}
          </div>
        ))}
      </div>

      <div style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
        borderRadius: 20,
        padding: 32,
      }}>

        {/* Step 0: Business Details */}
        {step === 0 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Business Details</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>Enter basic information about the MSME applicant</p>

            <div style={{ display: "grid", gap: 18 }}>
              <div>
                <label style={labelStyle}>BUSINESS NAME *</label>
                <input style={inputStyle} value={form.business_name} onChange={(e) => set("business_name", e.target.value)} placeholder="e.g. Sharma Textiles Pvt. Ltd." />
              </div>
              <div>
                <label style={labelStyle}>GSTIN *</label>
                <input style={inputStyle} value={form.gstin} onChange={(e) => set("gstin", e.target.value.toUpperCase())} placeholder="e.g. 27AAPFU0939F1ZV" maxLength={15} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelStyle}>BUSINESS TYPE</label>
                  <select style={inputStyle} value={form.business_type} onChange={(e) => set("business_type", e.target.value)}>
                    {BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>CITY</label>
                  <select style={inputStyle} value={form.city} onChange={(e) => set("city", e.target.value)}>
                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={labelStyle}>YEARS IN BUSINESS: {form.years_in_business}</label>
                <input type="range" min={1} max={20} value={form.years_in_business}
                  onChange={(e) => set("years_in_business", parseInt(e.target.value))}
                  style={{ width: "100%", accentColor: "#3b82f6" }} />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Data Sources */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Alternate Data Sources</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>
              Our AI will pull data from these sources to compute your Financial Health Score
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {dataSources.map((ds) => (
                <div key={ds.name} style={{
                  background: "var(--c-bg)",
                  border: `1px solid ${ds.color}33`,
                  borderRadius: 12,
                  padding: "14px 16px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ fontSize: 22 }}>{ds.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: ds.color }}>{ds.name}</div>
                    <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{ds.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: 20, padding: "12px 16px",
              background: "#3b82f611", border: "1px solid #3b82f633",
              borderRadius: 10, fontSize: 12, color: "#93c5fd",
            }}>
              ⚡ Data is fetched via RBI-approved Account Aggregator (AA) framework with your consent. Processing takes under 30 seconds.
            </div>
          </div>
        )}

        {/* Step 2: Consent */}
        {step === 2 && (
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Consent & Data Sharing</h2>
            <p style={{ color: "#64748b", fontSize: 13, marginBottom: 24 }}>
              As per RBI Account Aggregator guidelines, your explicit consent is required
            </p>

            <div style={{
              background: "var(--c-bg)", border: "1px solid var(--c-border)",
              borderRadius: 12, padding: 20, marginBottom: 20,
              fontSize: 13, color: "#94a3b8", lineHeight: 1.7,
            }}>
              <strong style={{ color: "var(--c-text)", display: "block", marginBottom: 8 }}>I hereby consent to:</strong>
              <div>• Sharing of my GST filing data for credit assessment</div>
              <div>• Fetching bank statements via Account Aggregator framework</div>
              <div>• Access to EPFO records for employment verification</div>
              <div>• Use of UPI transaction patterns for cash flow analysis</div>
              <div style={{ marginTop: 12, color: "#64748b", fontSize: 11 }}>
                This consent is valid for 90 days and can be revoked at any time.
              </div>
            </div>

            <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
              <input type="checkbox" checked={form.consent_given} onChange={(e) => set("consent_given", e.target.checked)}
                style={{ width: 18, height: 18, accentColor: "#3b82f6", cursor: "pointer" }} />
              <span style={{ fontSize: 13, color: "#cbd5e1" }}>
                I agree to share my financial data for credit assessment under the AA framework
              </span>
            </label>

            <div style={{
              marginTop: 20, padding: "12px 16px",
              background: "#15803d11", border: "1px solid #15803d33",
              borderRadius: 10, fontSize: 12, color: "#86efac",
            }}>
              🔒 Your data is encrypted end-to-end and never shared with third parties without consent.
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            style={{
              padding: "10px 24px", borderRadius: 10,
              background: "transparent", border: "1px solid var(--c-border)",
              color: step === 0 ? "#64748b" : "#94a3b8",
              fontSize: 14, cursor: step === 0 ? "not-allowed" : "pointer",
            }}
          >
            Back
          </button>

          {step < 2 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={step === 0 && (!form.business_name || !form.gstin)}
              style={{
                padding: "10px 28px", borderRadius: 10,
                background: "#3b82f6", border: "none",
                color: "#fff", fontSize: 14, fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!form.consent_given || loading}
              style={{
                padding: "10px 28px", borderRadius: 10,
                background: form.consent_given && !loading ? "#22c55e" : "#64748b",
                border: "none", color: "#fff", fontSize: 14, fontWeight: 600,
                cursor: form.consent_given && !loading ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              {loading ? (
                <><span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</span> Computing Score...</>
              ) : (
                "Generate Health Score →"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
