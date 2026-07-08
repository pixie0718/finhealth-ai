# Problem Statement Audit — FinHealth AI vs. IDBI Innovate 2026 Brief

This is an honest, code-level audit of how much of the hackathon problem statement is genuinely implemented versus simulated/synthetic. Every finding below is traced to a specific file and function — nothing here is taken from README/marketing claims at face value.

**Audit date:** 2026-07-08

---

## Problem Statement (as given)

> Bank's MSME credit evaluation relies on traditional financial documents, which many New-to-Credit (NTC) and New-to-Bank (NTB) enterprises lack or maintain inadequately. Despite availability of rich alternate data (GST, UPI, AA, EPFO, etc.), absence of a unified assessment framework leads to high rejection rates, missed viable borrowers, limited portfolio diversification, and slower financial inclusion progress.

### Expected Outcome

> Participants should design an AI/ML-driven MSME Financial Health Card that aggregates alternate data (GST, UPI, AA, EPFO, etc.), computes a multidimensional financial health score, visualizes strengths and risks, integrates with ULI/OCEN/AA ecosystems, enables near real-time credit assessment, and expands onboarding of credit-invisible MSMEs while improving portfolio quality.

---

## Core Problem — Solved

The heart of the brief — *NTC/NTB enterprises lack traditional documents and get unfairly excluded* — is **genuinely solved**, not just cosmetically addressed:

- `backend/ml/feature_engineering.py` → `compute_pillar_scores(ntc_mode=...)` suppresses the Credit pillar and **redistributes its weight** across the remaining four pillars when a business has no credit bureau history. This is real scoring math, not a banner.
- `get_loan_eligibility(ntc_flag, ntb_flag)` routes NTC/NTB businesses to a different, appropriate set of loan products instead of rejecting them outright.
- The frontend surfaces this transparently: *"No Credit History Detected — You Still Qualify."*

---

## Requirement-by-Requirement Audit

| # | Requirement | Verdict | Evidence |
|---|---|---|---|
| 1 | **Multidimensional financial health score** | ✅ **REAL** | Trained `XGBClassifier` (`backend/ml/trained_model.joblib`, 237 KB) loaded via `model.py`; live SHAP explanations via `shap.TreeExplainer` in `backend/ml/explainer.py` — computed per-request, not templated. |
| 2 | **Visualize strengths & risks** | ✅ **REAL** | Frontend radar chart, strengths/improve panels, 5-pillar breakdown — all rendered from live model + SHAP output (`HealthCard.jsx`). |
| 3 | **NTC/NTB onboarding** | ✅ **REAL** | Differentiated pillar reweighting + product routing, see "Core Problem" above (`feature_engineering.py`). |
| 4 | **Near real-time credit assessment** | ✅ **REAL** | `/api/score/generate` (`backend/routers/score.py`) is a single synchronous handler — profile → features → score → SHAP — no queue/batch job. Measured server compute: ~22ms. |
| 5 | **Portfolio diversification (bank side)** | ✅ **REAL**, with a caveat | `frontend/src/components/PortfolioAnalytics.jsx` aggregates real stored score history (risk-band distribution, sector averages). Caveat: the `/benchmark` peer-comparison endpoint generates **200 fresh synthetic profiles per request** rather than comparing against the actual submitted MSME pool. |
| 6 | **GST integration** | 🟡 **PARTIAL** | `backend/services/gst_setu.py` has a real `httpx` call path to a live GST SETU endpoint (`fetch_real_gst_data`), gated by `is_configured()` checking `GST_SETU_API_KEY`. But `backend/.env.example` ships this key **blank** — so in practice it has never been exercised against a real key, and every run falls back to `SYNTHETIC/SANDBOX` mode (`gst_provenance`). |
| 7 | **UPI transaction data** | 🔴 **ABSENT** (synthetic only) | No NPCI/UPI API client exists anywhere. `backend/data/synthetic_generator.py` → `generate_upi_aa_data()` fabricates all UPI figures from a seeded RNG. Frontend only displays "UPI" as a label. |
| 8 | **EPFO data** | 🔴 **ABSENT** (synthetic only) | No EPFO API client. `synthetic_generator.py` → `generate_epfo_data()` fabricates headcount/salary/compliance figures; `"source": "EPFO Unified Portal"` is a hardcoded string, not a fetch result. |
| 9 | **Account Aggregator (AA) integration** | 🔴 **ABSENT** as a real network integration | `_make_consent_artifact()` (`backend/routers/score.py`) builds a well-formed consent-artifact JSON (FIU/AA operator/FIP list, SHA-256 signature) and stores it locally — but no call is ever made to a real AA gateway (e.g. Sahamati, Setu, Finvu). It's a correctly-shaped artifact with no network behind it. |
| 10 | **OCEN integration** | 🔴 **ABSENT** (mocked) | `backend/routers/ocen.py`'s own docstring states it's a mock. `submit_credit_request()` builds a local request object and calls `_simulate_ocen_response()` — a pure function that fabricates a lender decision by thresholding the stored score. No outbound call to any OCEN gateway. |
| 11 | **ULI (Unified Lending Interface) integration** | 🔴 **COMPLETELY ABSENT** | A case-insensitive, repo-wide search for "ULI" returns **zero code references**. It appears exactly once, in `PROJECT_ANALYSIS.md`, as a roadmap/TODO note — no implementation, not even a mock endpoint. **This is explicitly named in the problem statement's Expected Outcome** and is the single biggest gap. |

---

## Bottom Line

**What's strong:** The actual AI/ML core — the scoring model, SHAP explainability, and NTC/NTB fairness logic — is real, working code, not a demo shell. This is the hardest and most valuable part of the brief, and it's done properly.

**What's weak:** Every *ecosystem integration* named in the brief (GST, UPI, AA, EPFO, OCEN, ULI) currently terminates in synthetic data or a local simulation — none of them make a real outbound call to their respective live network. GST is the closest to real (the code path exists, only a key is missing); ULI is the furthest (doesn't exist at all, in code or even as a stub).

**Risk if asked directly by judges:** "How does this integrate with ULI?" has no honest answer today beyond "it's on the roadmap." Everything else can honestly be defended as "sandbox mode with deterministic synthetic fallback" — a legitimate, disclosed design choice — but ULI has no fallback story because there's no code at all.

## Recommendations (priority order)

1. **Add a mock ULI router**, structured like `backend/routers/ocen.py` (i.e. clearly labeled as simulated, same pattern as the existing OCEN mock). This closes the "zero mention" gap and lets the pitch honestly claim "integrates with ULI/OCEN/AA ecosystems" at the same fidelity level as the other two.
2. **Disclose the sandbox/synthetic nature explicitly** in the pitch/demo (README and SUBMISSION.md already do this for GST — extend the same honesty to AA/OCEN/UPI/EPFO). This heads off judges discovering it themselves and reads as rigor rather than a gap.
3. **If time allows, obtain a real GST SETU sandbox key** — this is the one integration where the real code path already exists and just needs a credential to flip from SYNTHETIC to REAL.
4. **Reframe the `/benchmark` peer-comparison** as "simulated industry peer set" in the UI copy, since it's generated fresh per request rather than drawn from real submitted MSMEs — currently the UI doesn't disclose this.
