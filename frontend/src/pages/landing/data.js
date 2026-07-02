// Shared content for the landing-page design variants.

export const STATS = [
  { end: 10000, separator: true, suffix: "+", label: "MSMEs Assessed" },
  { end: 98.2, decimals: 1, suffix: "%", label: "ML Accuracy" },
  { end: 30, prefix: "< ", suffix: "s", label: "Score Generated" },
  { end: 11, label: "Loan Products" },
];

export const HERO_PILLARS = [
  { label: "Cash Flow", val: 82, color: "#3b82f6" },
  { label: "Compliance", val: 91, color: "#8b5cf6" },
  { label: "Growth", val: 76, color: "#06b6d4" },
  { label: "Stability", val: 84, color: "#f59e0b" },
];

export const FEATURES = [
  { icon: "⚡", title: "Instant Score from GSTIN", desc: "Type a GST number and get a 0–100 financial health score in seconds — no balance sheets, no paperwork, no branch visit." },
  { icon: "🧩", title: "5-Pillar Breakdown", desc: "Every score is split into Cash Flow, Compliance, Growth, Stability and Credit Worthiness — so you see exactly what drives it." },
  { icon: "🔍", title: "Explainable AI (SHAP)", desc: "Not a black box. Each decision shows the top factors pushing the score up or down, in plain language." },
  { icon: "💰", title: "Loan Eligibility & Products", desc: "Get an eligible loan amount, a risk band, and matched products — including MUDRA, CGTMSE and Stand-Up India schemes." },
  { icon: "🌱", title: "New-to-Credit Fairness", desc: "No CIBIL history? We re-weight the score around GST & cash-flow instead of rejecting you — credit access for first-timers." },
  { icon: "🤖", title: "Built-in AI Assistant", desc: "Ask questions about any score, loan option or improvement tip and get instant answers from a Gemini-powered advisor." },
];

export const STEPS = [
  { n: "1", title: "Enter GSTIN & Consent", desc: "The business owner shares their GSTIN and gives RBI-AA consent to pull data." },
  { n: "2", title: "Alternate Data Fetched", desc: "GST, UPI/bank, EPFO and credit-bureau data are pulled via the Account Aggregator framework." },
  { n: "3", title: "AI Scores & Explains", desc: "An XGBoost model scores the 5 pillars and SHAP explains the key drivers." },
  { n: "4", title: "Decision in Seconds", desc: "Owner sees loan eligibility; the bank officer gets an explainable, audit-ready credit report." },
];

export const DATA_SOURCES = [
  { icon: "📊", label: "GST Network", desc: "Filing history & turnover" },
  { icon: "🏦", label: "Account Aggregator", desc: "RBI AA consented pull" },
  { icon: "📱", label: "UPI / NPCI", desc: "Cash-flow & bounce data" },
  { icon: "👥", label: "EPFO", desc: "Payroll & headcount" },
  { icon: "💳", label: "Credit Bureau", desc: "CIBIL when available" },
];
