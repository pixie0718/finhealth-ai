import React, { useState } from "react";
import { applyForLoan } from "../api/client";
import useIsMobile from "../hooks/useIsMobile";

const PRODUCT_LABELS = {
  msme_loan:        "MSME Loan",
  working_capital:  "Working Capital Loan",
  business_loan:    "Business Loan",
  personal_loan:    "Personal Loan",
  auto_loan:        "Auto Loan",
  home_loan:        "Home Loan",
  // NTC / MUDRA products
  mudra_shishu:     "MUDRA Shishu (up to ₹50K)",
  mudra_kishore:    "MUDRA Kishore (up to ₹5L)",
  mudra_tarun:      "MUDRA Tarun (up to ₹10L)",
  cgtmse_backed:    "CGTMSE-Backed Loan",
  standup_india:    "Stand-Up India",
};

const riskColor = { LOW: "#22c55e", "MEDIUM-LOW": "#eab308", MEDIUM: "#f97316", HIGH: "#ef4444" };

export default function LoanApplyCTA({ data }) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState("select"); // select | confirm | done
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [ref, setRef] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loan = data.loan_eligibility;
  const eligible = Object.entries(loan?.products || {}).filter(([, p]) => p.eligible);
  const rc = riskColor[loan?.risk_band] || "#64748b";

  // Check if already applied for this MSME
  const alreadyApplied = localStorage.getItem(`loan_applied_${data?.msme_id}`) !== null;

  if (!eligible.length || loan?.risk_band === "HIGH") return null;

  const close = () => { setOpen(false); setStep("select"); setSelectedProduct(null); setError(""); };

  const submit = async () => {
    const product = loan.products[selectedProduct];
    setSubmitting(true);
    setError("");
    try {
      const res = await applyForLoan(data.msme_id, {
        product: selectedProduct,
        loan_amount: product.amount,
        interest_rate: product.interest_rate,
        tenure_months: product.tenure_months,
      });
      const refNum = res.data.reference;
      setRef(refNum);
      localStorage.setItem(`loan_applied_${data.msme_id}`, refNum);
      setStep("done");
    } catch (e) {
      setError(e?.response?.data?.detail || "Couldn't submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const fmtL = v => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${Math.round(v).toLocaleString("en-IN")}`;

  return (
    <>
      {/* Floating "Apply Now" bar — stays on screen so users don't have to scroll to find it */}
      {!alreadyApplied && !open && (
        <div style={{
          position: "fixed", left: 0, right: 0,
          bottom: isMobile ? 74 : 0, zIndex: 900,
          background: "var(--c-header)", backdropFilter: "blur(10px)",
          borderTop: `1px solid ${rc}44`,
          boxShadow: "0 -4px 24px #00000033",
          padding: isMobile ? "10px 14px" : "12px 24px",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: "100%", maxWidth: 900,
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10, color: rc, fontWeight: 700, letterSpacing: 1 }}>PRE-QUALIFIED</div>
              <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 800, color: "var(--c-text)", whiteSpace: "nowrap" }}>
                Eligible up to {fmtL(loan.eligible_loan_amount)}
              </div>
            </div>
            <button onClick={() => setOpen(true)} style={{
              padding: isMobile ? "10px 18px" : "12px 28px",
              background: `linear-gradient(135deg, ${rc}, ${rc}bb)`,
              border: "none", borderRadius: 12,
              color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
              boxShadow: `0 4px 20px ${rc}44`,
            }}>
              Apply Now →
            </button>
          </div>
        </div>
      )}

      {/* CTA Banner */}
      <div style={{
        background: alreadyApplied ? `linear-gradient(135deg, #22c55e11, #22c55e08)` : `linear-gradient(135deg, ${rc}11, ${rc}08)`,
        border: alreadyApplied ? `1px solid #22c55e33` : `1px solid ${rc}33`,
        borderRadius: 16, padding: "20px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 14,
      }}>
        <div>
          <div style={{ fontSize: 11, color: alreadyApplied ? "#22c55e" : rc, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
            {alreadyApplied ? "APPLICATION SUBMITTED" : "YOU'RE PRE-QUALIFIED"}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "var(--c-text)" }}>
            {alreadyApplied ? "Your application is under review" : `Apply for up to ${fmtL(loan.eligible_loan_amount)}`}
          </div>
          <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
            {alreadyApplied
              ? "A relationship manager will contact you within 2 business days"
              : `${eligible.length} loan product${eligible.length > 1 ? "s" : ""} available • Based on your FinHealth score`}
          </div>
        </div>
        {!alreadyApplied && (
          <button onClick={() => setOpen(true)} style={{
            padding: "12px 28px",
            background: `linear-gradient(135deg, ${rc}, ${rc}bb)`,
            border: "none", borderRadius: 12,
            color: "#fff", fontSize: 14, fontWeight: 700,
            cursor: "pointer", whiteSpace: "nowrap",
            boxShadow: `0 4px 20px ${rc}44`,
          }}>
            Apply Now →
          </button>
        )}
        {alreadyApplied && (
          <div style={{
            padding: "12px 28px",
            background: "var(--c-surface)",
            border: "1px solid #22c55e55", borderRadius: 12,
            color: "#22c55e", fontSize: 14, fontWeight: 700,
            whiteSpace: "nowrap",
          }}>
            ✓ Already Applied
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "#00000088", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 16,
        }} onClick={e => e.target === e.currentTarget && close()}>
          <div style={{
            background: "var(--c-bg)", border: "1px solid var(--c-border)",
            borderRadius: 24, width: "100%", maxWidth: 520,
            padding: 32, position: "relative",
          }}>
            <button onClick={close} style={{
              position: "absolute", top: 16, right: 16,
              background: "transparent", border: "none",
              color: "#475569", fontSize: 20, cursor: "pointer",
            }}>✕</button>

            {/* STEP 1: Select product */}
            {step === "select" && (
              <>
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 11, color: "#3b82f6", letterSpacing: 2, marginBottom: 6 }}>LOAN APPLICATION</div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--c-text)" }}>Select a Loan Product</h2>
                  <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                    {data.business_name} • {data.city} • Score {data.pillar_scores?.overall}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {eligible.map(([key, product]) => (
                    <div key={key} onClick={() => setSelectedProduct(key)} style={{
                      background: selectedProduct === key ? "#3b82f611" : "var(--c-surface)",
                      border: selectedProduct === key ? "1px solid #3b82f655" : "1px solid var(--c-border)",
                      borderRadius: 12, padding: "14px 18px", cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      transition: "all 0.15s",
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--c-text)" }}>
                          {PRODUCT_LABELS[key]}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>
                          {product.interest_rate}% p.a. • {product.tenure_months} months
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: rc }}>{fmtL(product.amount)}</div>
                        <div style={{ fontSize: 10, color: "#475569" }}>eligible</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setStep("confirm")}
                  disabled={!selectedProduct}
                  style={{
                    width: "100%", padding: "14px",
                    background: selectedProduct ? `linear-gradient(135deg, #3b82f6, #8b5cf6)` : "var(--c-surface)",
                    border: "none", borderRadius: 12,
                    color: selectedProduct ? "#fff" : "#475569",
                    fontSize: 14, fontWeight: 700,
                    cursor: selectedProduct ? "pointer" : "not-allowed",
                  }}>
                  Continue →
                </button>
              </>
            )}

            {/* STEP 2: Confirm */}
            {step === "confirm" && selectedProduct && (() => {
              const product = loan.products[selectedProduct];
              return (
                <>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 11, color: "#3b82f6", letterSpacing: 2, marginBottom: 6 }}>CONFIRM APPLICATION</div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--c-text)" }}>Review & Submit</h2>
                  </div>

                  <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 20, marginBottom: 20 }}>
                    {[
                      { label: "Business", value: data.business_name },
                      { label: "GSTIN", value: data.gstin },
                      { label: "City", value: data.city },
                      { label: "Product", value: PRODUCT_LABELS[selectedProduct] },
                      { label: "Loan Amount", value: fmtL(product.amount) },
                      { label: "Interest Rate", value: `${product.interest_rate}% p.a.` },
                      { label: "Tenure", value: `${product.tenure_months} months` },
                      { label: "FinHealth Score", value: data.pillar_scores?.overall },
                    ].map(({ label, value }) => (
                      <div key={label} style={{
                        display: "flex", justifyContent: "space-between",
                        padding: "8px 0", borderBottom: "1px solid var(--c-border-strong)",
                        fontSize: 13,
                      }}>
                        <span style={{ color: "#64748b" }}>{label}</span>
                        <span style={{ color: "var(--c-text)", fontWeight: 500 }}>{value}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    background: "#15803d11", border: "1px solid #15803d33",
                    borderRadius: 10, padding: "10px 14px", fontSize: 12,
                    color: "#86efac", marginBottom: 20,
                  }}>
                    🔒 By submitting, you authorize IDBI Bank to verify your financial data via the AA framework.
                  </div>

                  {error && (
                    <div style={{
                      background: "#dc262611", border: "1px solid #dc262633", borderRadius: 10,
                      padding: "10px 14px", fontSize: 12, color: "#fca5a5", marginBottom: 14,
                    }}>{error}</div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <button onClick={() => setStep("select")} disabled={submitting} style={{
                      padding: "12px", background: "transparent",
                      border: "1px solid var(--c-border)", borderRadius: 12,
                      color: "#94a3b8", fontSize: 14, cursor: submitting ? "not-allowed" : "pointer",
                    }}>← Back</button>
                    <button onClick={submit} disabled={submitting} style={{
                      padding: "12px",
                      background: submitting ? "var(--c-surface-2)" : "linear-gradient(135deg, #22c55e, #15803d)",
                      border: "none", borderRadius: 12,
                      color: "#fff", fontSize: 14, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
                    }}>{submitting ? "Submitting…" : "Submit Application"}</button>
                  </div>
                </>
              );
            })()}

            {/* STEP 3: Done */}
            {step === "done" && (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "#15803d22", border: "2px solid #22c55e",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32, margin: "0 auto 20px",
                }}>✓</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--c-text)", marginBottom: 8 }}>
                  Application Submitted!
                </h2>
                <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.6 }}>
                  Your {PRODUCT_LABELS[selectedProduct]} application has been received by IDBI Bank.
                  A relationship manager will contact you within 2 business days.
                </p>
                <div style={{
                  background: "var(--c-surface)", borderRadius: 12, padding: "14px 20px",
                  marginBottom: 24,
                }}>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>REFERENCE NUMBER</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#3b82f6", letterSpacing: 2 }}>{ref}</div>
                  <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>
                    Save this for tracking your application
                  </div>
                </div>
                <button onClick={close} style={{
                  width: "100%", padding: "12px",
                  background: "var(--c-surface)", border: "1px solid var(--c-border)",
                  borderRadius: 12, color: "#94a3b8", fontSize: 14, cursor: "pointer",
                }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
