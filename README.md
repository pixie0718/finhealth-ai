# FinHealth AI — MSME Financial Health Score Platform

> Instant, explainable credit scores for MSMEs from the data they already have — GST, UPI and Account-Aggregator — so small businesses get faster loans and banks lend with confidence. **No documents. No branch visits.**

Built for **IDBI Innovate 2026**.

---

## The Problem

Tens of millions of Indian MSMEs are *credit invisible* — they can't get a loan because they lack formal balance sheets or a CIBIL history. Traditional underwriting rejects them by default.

## The Solution

FinHealth AI reads the **alternate data a business already generates** (GST returns, UPI/bank transactions, EPFO payroll, and CIBIL where available) through the **RBI Account Aggregator** framework, and produces a bank-grade, **explainable** credit assessment in seconds — for both the business owner and the lending officer.

---

## Key Features

- ⚡ **Instant score from GSTIN** — a 0–100 financial health score with no paperwork.
- 🧩 **5-pillar breakdown** — Cash Flow, Compliance, Growth, Stability, Credit Worthiness.
- 🔍 **Explainable AI (SHAP)** — every score shows the top factors pushing it up or down.
- 💰 **Loan eligibility & products** — eligible amount, risk band, and matched products including **MUDRA, CGTMSE and Stand-Up India** government schemes.
- 🌱 **New-to-Credit (NTC) fairness** — businesses with no CIBIL history are scored on their alternate data instead of being rejected; the credit pillar's weight is redistributed.
- 📝 **Real loan applications** — owners apply from the result screen; bankers see incoming applications in their dashboard.
- 🤖 **Built-in AI assistant** — a Gemini-powered advisor answers questions about any score, loan option or improvement tip.
- 🔐 **Consent-first** — each assessment mints a signed, time-bound RBI-AA consent artifact; consent is revocable.
- 👥 **Two role-based portals** — separate Business Owner and Bank Manager experiences with enforced access.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy, SQLite |
| ML | XGBoost, SHAP, scikit-learn, pandas / numpy |
| AI Assistant | Google Gemini (`gemini-2.5-flash`) |
| Auth | JWT (python-jose), passlib |
| Frontend | React 19 (Create React App), React Router, Recharts, Axios |

> **Note:** All external data (GST / UPI / AA / EPFO / CIBIL) is **synthetic** — generated deterministically per GSTIN for demonstration. There are no live third-party integrations.

---

## Project Structure

```
finhealth-ai/
├── backend/
│   ├── main.py                 # FastAPI app + startup
│   ├── database.py             # SQLAlchemy models & helpers
│   ├── routers/                # auth, score, chat endpoints
│   ├── ml/                     # feature engineering, XGBoost model, SHAP explainer
│   ├── data/                   # synthetic data generator
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/              # Landing, AuthPage, MSMEPortal, Dashboard, ...
│       ├── components/         # HealthCard, ScoreSimulator, ChatAssistant, ...
│       ├── hooks/              # useIsMobile
│       └── api/client.js       # Axios client
└── presentation.html
```

---

## Getting Started

### Prerequisites
- Python 3.10+ and Node.js 18+

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r requirements.txt

# configure secrets
cp .env.example .env                 # then edit .env

uvicorn main:app --port 8000
```

The API runs at `http://localhost:8000` (interactive docs at `/docs`).
On first boot the app pre-computes a peer-benchmark cache, which can take a couple of minutes; subsequent boots are fast.

### 2. Frontend

```bash
cd frontend
npm install
npm start                            # http://localhost:3000
```

### Environment variables (`backend/.env`)

| Variable | Purpose |
|----------|---------|
| `SECRET_KEY` | JWT signing key (generate: `python -c "import secrets;print(secrets.token_urlsafe(48))"`) |
| `GEMINI_API_KEY` | Google Gemini key for the AI assistant (optional — chat returns 503 if unset) |

The frontend points at `http://localhost:8000` by default; override with `REACT_APP_API_URL` in `frontend/.env`.

---

## Usage

1. Open the app and pick a portal from the landing page:
   - **Business Owner** (`/owner/login`) — enter a GSTIN, give consent, and get your score, loan eligibility and improvement tips.
   - **Bank Manager** (`/manager/login`) — review AI-scored applications, run demo scores, track loan outcomes, and see incoming applications.
2. Register with your role, then you're taken to the matching dashboard. Accounts are enforced to their own portal.

---

## API Overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register`, `/api/auth/login` | Auth (returns JWT) |
| POST | `/api/score/generate` | Generate a score from GSTIN + details |
| GET | `/api/score/demo` | Random demo score |
| GET | `/api/score/history`, `/api/score/trend` | Score history & trend |
| GET | `/api/score/benchmark` | Peer benchmark by business type & city |
| POST | `/api/score/{id}/apply` | Submit a loan application |
| GET | `/api/score/applications/all` | Incoming applications (banker) |
| POST | `/api/score/{id}/outcome`, `GET /api/score/outcomes/all` | Loan outcomes & portfolio stats (banker) |
| POST | `/api/chat` | AI assistant (Gemini) |

All endpoints except register/login require a Bearer JWT.

---

## License

Prototype built for IDBI Innovate 2026. For demonstration purposes.
