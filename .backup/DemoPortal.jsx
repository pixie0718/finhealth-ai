import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MSMEResult from "./MSMEResult";

export default function DemoPortal() {
  const { scenario } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Pre-loaded demo scores
  const DEMOS = {
    "growth-star": {
      msme_id: "demo-growth-001",
      business_name: "Sharma Textiles Pvt. Ltd.",
      gstin: "27AAPFU0939F1ZV",
      business_type: "Textile",
      city: "Surat",
      years_in_business: 8,
      ntc_flag: false,
      ntb_flag: false,
      pillar_scores: {
        cash_flow: 82,
        compliance: 91,
        growth: 76,
        stability: 84,
        credit_worthiness: 79,
        overall: 82.4,
      },
      loan_eligibility: {
        eligible_loan_amount: 5000000,
        risk_band: "LOW",
        multiplier_used: 5,
        recommendation: "APPROVED",
        products: {
          mudra_tarun: { eligible: true, amount: 5000000, interest_rate: 8.5, tenure_months: 60 },
          cgtmse_backed: { eligible: true, amount: 5000000, interest_rate: 9.0, tenure_months: 60 },
          business_loan: { eligible: true, amount: 7500000, interest_rate: 9.5, tenure_months: 60 },
          msme_loan: { eligible: false },
          working_capital: { eligible: false },
          personal_loan: { eligible: false },
          auto_loan: { eligible: false },
          home_loan: { eligible: false },
          mudra_shishu: { eligible: false },
          mudra_kishore: { eligible: false },
          standup_india: { eligible: false },
        },
      },
      ml_prediction: {
        prediction: "CREDITWORTHY",
        confidence: 0.94,
      },
      explanations: {
        strengths: [
          { label: "Revenue Growth", icon: "📈" },
          { label: "GST Compliance", icon: "📋" },
          { label: "Cash Flow Ratio", icon: "💧" },
        ],
        risks: [],
        top_drivers: [
          { feature: "Revenue Trend", impact: 15, direction: "positive" },
          { feature: "GST Compliance", impact: 12, direction: "positive" },
          { feature: "Cash Flow Ratio", impact: 11, direction: "positive" },
          { feature: "Employee Growth", impact: 9, direction: "positive" },
          { feature: "CIBIL Score", impact: 8, direction: "positive" },
        ],
      },
      recommendations: [
        { icon: "📋", title: "GST Compliance", detail: "Maintain filing consistency - excellent 95% rate", priority: "medium" },
        { icon: "📈", title: "Revenue Growth", detail: "Continue growth trajectory - 18% YoY growth", priority: "medium" },
        { icon: "💼", title: "Credit Expansion", detail: "Increase credit limits gradually to expand capacity", priority: "low" },
      ],
      monthly_revenues: [850000, 920000, 980000, 1050000, 1100000, 1180000, 1200000, 1250000, 1300000, 1350000, 1400000, 1450000, 1500000, 1550000, 1600000, 1650000, 1700000, 1750000],
      monthly_inflows: [900000, 950000, 1000000, 1080000, 1150000, 1220000, 1280000, 1350000, 1420000, 1500000, 1580000, 1650000, 1720000, 1800000, 1880000, 1950000, 2020000, 2100000],
      data_sources: {
        gst: { source: "GST", status: "FETCHED" },
        upi: { source: "UPI", status: "FETCHED" },
        epfo: { source: "EPFO", status: "FETCHED" },
        cibil: { source: "CIBIL", status: "FETCHED" },
      },
      raw_features: {
        cash_flow_ratio: 0.85,
        inflow_stability: 0.92,
        bounce_rate: 0.02,
        avg_balance_ratio: 1.2,
        gst_compliance: 0.95,
        epfo_compliance: 0.90,
        combined_compliance: 0.93,
        tax_to_revenue: 0.18,
        revenue_growth: 0.18,
        emp_growth: 0.15,
        avg_monthly_revenue: 1200000,
      },
      generated_at: new Date().toISOString(),
      consent_id: "CONSENT-DEMO-001",
    },

    "ntc-challenge": {
      msme_id: "demo-ntc-002",
      business_name: "Fresh Foods Cooperative",
      gstin: "19AACCU1234F2Z5",
      business_type: "Food Processing",
      city: "Delhi",
      years_in_business: 2,
      ntc_flag: true,
      ntb_flag: true,
      pillar_scores: {
        cash_flow: 68,
        compliance: 72,
        growth: 65,
        stability: 62,
        credit_worthiness: null,
        overall: 66.75,
      },
      loan_eligibility: {
        eligible_loan_amount: 2000000,
        risk_band: "MEDIUM",
        multiplier_used: 1.5,
        recommendation: "UNDER_REVIEW",
        products: {
          mudra_kishore: { eligible: true, amount: 2000000, interest_rate: 9.5, tenure_months: 48 },
          working_capital: { eligible: true, amount: 1500000, interest_rate: 10.0, tenure_months: 24 },
          msme_loan: { eligible: false },
          business_loan: { eligible: false },
          personal_loan: { eligible: false },
          auto_loan: { eligible: false },
          home_loan: { eligible: false },
          mudra_shishu: { eligible: false },
          mudra_tarun: { eligible: false },
          cgtmse_backed: { eligible: false },
          standup_india: { eligible: false },
        },
      },
      ml_prediction: {
        prediction: "UNDER_REVIEW",
        confidence: 0.72,
      },
      explanations: {
        strengths: [
          { label: "GST Filing Consistency", icon: "📋" },
        ],
        risks: [
          { label: "New Business", icon: "⚠️" },
          { label: "No CIBIL History", icon: "❓" },
        ],
        top_drivers: [
          { feature: "GST Filing Consistency", impact: 10, direction: "positive" },
          { feature: "Monthly Revenue", impact: 9, direction: "positive" },
          { feature: "Cash Balance", impact: 8, direction: "neutral" },
          { feature: "New Business", impact: -7, direction: "negative" },
          { feature: "No CIBIL History", impact: 0, direction: "neutral" },
        ],
      },
      recommendations: [
        { icon: "📋", title: "GST Priority", detail: "Maintain GST filings - critical for NTC scoring", priority: "high" },
        { icon: "📈", title: "Revenue Pattern", detail: "Build consistent revenue pattern over next 12 months", priority: "high" },
        { icon: "⏱", title: "Timeline", detail: "After 2 years, eligible for higher credit limits", priority: "medium" },
        { icon: "🎯", title: "Stability Focus", detail: "Focus on business stability to improve score", priority: "medium" },
      ],
      monthly_revenues: [450000, 520000, 580000, 650000, 720000, 780000, 840000, 900000, 950000, 1000000, 1050000, 1100000, 1150000, 1200000, 1250000, 1300000, 1350000, 1400000],
      monthly_inflows: [480000, 560000, 620000, 700000, 780000, 850000, 920000, 1000000, 1080000, 1150000, 1220000, 1300000, 1380000, 1450000, 1520000, 1600000, 1680000, 1750000],
      data_sources: {
        gst: { source: "GST", status: "FETCHED" },
        upi: { source: "UPI", status: "FETCHED" },
        epfo: { source: "EPFO", status: "FETCHED" },
      },
      raw_features: {
        cash_flow_ratio: 0.68,
        inflow_stability: 0.75,
        bounce_rate: 0.08,
        avg_balance_ratio: 0.85,
        gst_compliance: 0.72,
        epfo_compliance: 0.65,
        combined_compliance: 0.70,
        tax_to_revenue: 0.18,
        revenue_growth: 0.12,
        emp_growth: 0.20,
        avg_monthly_revenue: 600000,
      },
      generated_at: new Date().toISOString(),
      consent_id: "CONSENT-DEMO-002",
    },

    "risk-case": {
      msme_id: "demo-risk-003",
      business_name: "Tech Solutions India",
      gstin: "29AABCU5678F1Z0",
      business_type: "IT Services",
      city: "Bangalore",
      years_in_business: 4,
      ntc_flag: false,
      ntb_flag: false,
      pillar_scores: {
        cash_flow: 45,
        compliance: 38,
        growth: 35,
        stability: 42,
        credit_worthiness: 52,
        overall: 42.4,
      },
      loan_eligibility: {
        eligible_loan_amount: 500000,
        risk_band: "HIGH",
        multiplier_used: 0.5,
        recommendation: "UNDER_REVIEW",
        products: {
          personal_loan: { eligible: true, amount: 500000, interest_rate: 13.5, tenure_months: 36 },
          working_capital: { eligible: false, amount: 300000, interest_rate: 14.0, tenure_months: 12 },
          msme_loan: { eligible: false },
          business_loan: { eligible: false },
          auto_loan: { eligible: false },
          home_loan: { eligible: false },
          mudra_shishu: { eligible: false },
          mudra_kishore: { eligible: false },
          mudra_tarun: { eligible: false },
          cgtmse_backed: { eligible: false },
          standup_india: { eligible: false },
        },
      },
      ml_prediction: {
        prediction: "HIGH_RISK",
        confidence: 0.88,
      },
      explanations: {
        strengths: [],
        risks: [
          { label: "GST Filing Non-Compliance", icon: "📋" },
          { label: "CIBIL Defaults", icon: "💳" },
          { label: "Revenue Volatility", icon: "📊" },
          { label: "Low Compliance Rate", icon: "⚠️" },
        ],
        top_drivers: [
          { feature: "GST Filing", impact: -15, direction: "negative" },
          { feature: "DPD 30+ Days", impact: -12, direction: "negative" },
          { feature: "Volatile Revenue", impact: -10, direction: "negative" },
          { feature: "Low Compliance", impact: -8, direction: "negative" },
          { feature: "CIBIL Score", impact: -6, direction: "negative" },
        ],
      },
      recommendations: [
        { icon: "⚠️", title: "GST Compliance URGENT", detail: "Improve GST filing compliance - currently 35%", priority: "high" },
        { icon: "💳", title: "CIBIL Defaults", detail: "Clear pending CIBIL defaults to improve credit score", priority: "high" },
        { icon: "📊", title: "Revenue Volatility", detail: "Stabilize monthly revenue - high volatility detected", priority: "high" },
        { icon: "📚", title: "Accounting Practices", detail: "Implement proper accounting practices", priority: "medium" },
        { icon: "🔄", title: "Reapply Timeline", detail: "Reapply after 6-12 months of consistent improvement", priority: "medium" },
      ],
      monthly_revenues: [250000, 180000, 320000, 150000, 280000, 200000, 350000, 120000, 290000, 170000, 310000, 140000, 300000, 160000, 330000, 130000, 310000, 150000],
      monthly_inflows: [280000, 200000, 350000, 170000, 310000, 220000, 380000, 140000, 320000, 190000, 340000, 160000, 330000, 180000, 360000, 150000, 340000, 170000],
      data_sources: {
        gst: { source: "GST", status: "FETCHED" },
        upi: { source: "UPI", status: "FETCHED" },
        cibil: { source: "CIBIL", status: "FETCHED" },
      },
      raw_features: {
        cash_flow_ratio: 0.45,
        inflow_stability: 0.42,
        bounce_rate: 0.22,
        avg_balance_ratio: 0.38,
        gst_compliance: 0.35,
        epfo_compliance: 0.20,
        combined_compliance: 0.30,
        tax_to_revenue: 0.12,
        revenue_growth: -0.05,
        emp_growth: -0.10,
        avg_monthly_revenue: 300000,
      },
      generated_at: new Date().toISOString(),
      consent_id: "CONSENT-DEMO-003",
    },
  };

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const result = DEMOS[scenario] || DEMOS["growth-star"];

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0a0f1e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            fontSize: 48,
            marginBottom: 20,
            animation: "spin 2s linear infinite",
          }}>⚡</div>
          <div style={{ color: "#94a3b8", fontSize: 14 }}>Loading demo scenario...</div>
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate("/")}
        style={{
          position: "fixed",
          top: 20,
          left: 20,
          zIndex: 100,
          background: "#1e293b",
          border: "1px solid #334155",
          color: "#e2e8f0",
          padding: "10px 16px",
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        ← Back to Landing
      </button>
      <MSMEResult result={result} onReset={() => navigate("/")} />
    </div>
  );
}
