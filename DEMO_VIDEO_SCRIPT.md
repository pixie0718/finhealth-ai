# FinHealth AI — Demo Video Script
**Target length: ~3:30 min | Tone: confident, clear, benefit-first | Audience: hackathon judges / investors**

---

## Before you record

- Close other tabs/notifications, use a clean browser window at 1920×1080 or 1440×900.
- Log out everywhere first so the recording shows real logins, not stale sessions.
- Have two accounts ready: an Owner account with an already-generated score ("Cre8r"), and the Manager account.
- Speak slightly slower than feels natural — it always sounds faster once edited.
- Move the mouse deliberately; pause on numbers for 1–2 seconds so viewers can read them.

---

## SCENE 0 — Team + Problem Statement (0:00–0:35)
**Visual:** Title card / landing page hero, before scrolling.

> "We are Team CodeCrafter, and we've built a solution to Problem Statement 3.
>
> Banks' MSME credit evaluation today relies on traditional financial documents — documents that many New-to-Credit and New-to-Bank enterprises simply don't have, or don't maintain properly. Yet rich alternate data already exists — GST, UPI, Account Aggregator, EPFO. Without a unified framework to assess it, banks are left with high rejection rates, missed viable borrowers, limited portfolio diversification, and slower financial inclusion.
>
> The expected outcome: an AI-driven MSME Financial Health Card that aggregates this alternate data, computes a multidimensional financial health score, visualizes strengths and risks, integrates with the ULI, OCEN, and AA ecosystems, enables near real-time credit assessment, and expands onboarding of credit-invisible MSMEs — while improving portfolio quality for the bank.
>
> That's exactly what we built."

---

## SCENE 1 — Hook (0:35–0:55)
**Visual:** Landing page (`localhost:3001/`), hero section, slow scroll to stats row.

> "43 million MSMEs in India generate the receipts, the GST filings, the UPI transactions — every signal a bank needs to trust them. But without a formal balance sheet, banks call them 'credit invisible.' Getting a loan takes two to three weeks, if it happens at all.
>
> This is FinHealth AI — an AI credit score for MSMEs, built entirely on data they already generate."

---

## SCENE 2 — Solution overview (0:20–0:45)
**Visual:** Continue scrolling landing page — stats row, "How it works" pillars, features section.

> "Instead of asking for three years of audited financials, FinHealth AI reads GST returns, bank and UPI cash flow via the RBI Account Aggregator framework, EPFO payroll filings, and credit bureau data — and turns it into a explainable, five-pillar credit score in under thirty seconds."

---

## SCENE 3 — Business Owner journey (0:45–2:05)

### 3a. Login (0:45–0:55)
**Visual:** Click "Business Login" → owner login screen → sign in.

> "Let's see it from a business owner's side."

### 3b. The score (0:55–1:25)
**Visual:** Land on the generated Financial Health Report. Hover over the score gauge, then the 5-pillar breakdown, then the risk band.

> "In seconds, the business gets a score out of 100 — here, 57.3, a 'Fair' rating with medium risk. It's broken down into five pillars: cash flow, compliance, growth, stability, and credit history — each independently weighted, so nothing is a black box."

### 3c. Explainability (1:25–1:40)
**Visual:** Scroll to AI Explanation (SHAP) card — strengths and risk factors.

> "Every score comes with an AI explanation — the exact factors pushing it up or down, powered by SHAP values. A banker — or the business owner — can see precisely why, not just what."

### 3d. No-GSTIN fairness (optional, 1:40–1:50)
**Visual:** If available, show the "Not GST-Registered" banner.

> "And for businesses without a GST registration — millions of them — FinHealth AI still scores them fairly, using bank and UPI cash flow alone, instead of shutting them out."

### 3e. Loan products + EMI calculator (1:50–2:05)
**Visual:** Scroll to loan eligibility banner → eligible products grid → EMI calculator, drag a slider.

> "Based on that score, the platform instantly shows which loan products the business qualifies for, at what rate — and lets them simulate the EMI right there, before ever talking to a bank."

### 3f. Apply (2:05–2:15)
**Visual:** Click the floating "Apply Now" bar → select a product → submit → show reference number.

> "One click, and the application is submitted — no paperwork, no branch visit."

---

## SCENE 4 — Bank Manager journey (2:15–3:05)

### 4a. Login + Dashboard (2:15–2:30)
**Visual:** Log out, log in as Bank Manager → Dashboard with portfolio stats.

> "Now let's flip to the bank's side. The moment that application lands, it shows up on the banker's dashboard — total applications, average score, portfolio value, all in one view."

### 4b. Applications list (2:30–2:45)
**Visual:** Click "Applications" tab → show filters (All / Submitted / Approved / Rejected) → filter by status.

> "Every application the bank has ever received — filterable by status, searchable by business name — lives in one place."

### 4c. Review + Approve (2:45–3:05)
**Visual:** Click "Details" on a pending application → scroll through score, radar chart, revenue trend, peer benchmark → click "Approve."

> "Clicking into any application gives the loan officer the full picture — the score, the AI explanation, an 18-month revenue trend, even how this business compares to its industry peers. One click to approve, one click to reject — and the business owner is notified instantly."

---

## SCENE 5 — Tech & close (3:05–3:30)
**Visual:** Quick cut back to landing page or an architecture diagram if you have one.

> "Under the hood: a FastAPI backend, a trained ML model with SHAP explainability, and a design built around the RBI Account Aggregator framework, OCEN, and GSTN — so it's not just a prototype, it's built for how India's credit infrastructure actually works.
>
> FinHealth AI turns thirty days of loan paperwork into thirty seconds of data — and brings 43 million invisible businesses into India's formal credit system.
>
> Thank you."

---

## Optional B-roll / cutaway shots (if you want extra polish)
- Score Simulator sliders moving in real time, score updating live.
- Peer benchmarking bar chart (your score vs. industry average).
- Dark/light theme toggle (shows attention to UI polish).
- Mobile view of the app (shows responsive design).
- "Submit to OCEN" action on the Manager side (shows real ecosystem integration).

## Pacing cheat-sheet
| Section | Time | Cumulative |
|---|---|---|
| Hook | 0:20 | 0:20 |
| Solution overview | 0:25 | 0:45 |
| Owner journey | 1:20 | 2:05 |
| Manager journey | 0:50 | 2:55 |
| Tech + close | 0:25 | 3:20–3:30 |
