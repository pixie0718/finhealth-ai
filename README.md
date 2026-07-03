# FinHealth AI 🚀
**India's First AI-Powered MSME Credit Scoring Platform**

Instant financial health assessment for small businesses using alternate data (GST, bank accounts, UPI) instead of traditional balance sheets.

**Live Demo:** http://localhost:3000  
**Challenge:** IDBI Innovate 2026  
**Problem:** 43M Indian MSMEs are "credit invisible" — no formal balance sheets = no loans  
**Solution:** AI-powered scoring on data they already generate

---

## ⚡ Quick Start

### 1. Prerequisites
- Docker & Docker Compose
- Git

### 2. One-Command Deploy
```bash
docker-compose up
```

This starts:
- **Frontend:** http://localhost:3000 (React 18)
- **Backend:** http://localhost:8000 (FastAPI)
- **Database:** MySQL on localhost:3306

### 3. Test the Platform (No Login Needed)
Visit http://localhost:3000 → Click "Try Live Demos"

**Demo Scenarios:**
- 📈 **Growth Star** (Score: 82) — Excellent business, instant approval
- 🌱 **NTC Challenge** (Score: 67) — New business, needs review
- ⚠️ **Risk Case** (Score: 42) — High risk, conditional approval

---

## 👥 User Flows

### Business Owner Path
1. Go to http://localhost:3000/owner/login
2. Register with email
3. Enter GSTIN
4. View instant score (0-100)
5. See loan eligibility & products
6. Apply for loan

### Bank Manager Path
1. Go to http://localhost:3000/manager/login
2. Register with email
3. View loan applications dashboard
4. Click "📊 Details" to review analysis
5. Click "✓ Approve" or "✕ Reject"
6. Owner gets instant notification

---

## 🏗️ Architecture

### Frontend Stack
- React 18 + Vite + TypeScript
- Tailwind CSS
- Responsive (mobile + desktop)
- Dark theme

### Backend Stack
- FastAPI + SQLAlchemy
- MySQL 8.0
- JWT authentication
- RBI AA compliant

### 8 Database Models
MSME, User, Application, Score, LoanProduct, AuditLog, Consent, Outcome

---

## ✅ Features

### For Business Owners
✅ Instant Score (30 seconds, no documents)
✅ 5-Pillar Breakdown (Cash Flow, Compliance, Growth, Stability, Credit)
✅ Loan Eligibility Calculator
✅ AI Explanation (SHAP values)
✅ EMI Calculator
✅ Revenue Trends (12-month visualization)

### For Bank Managers
✅ Loan Applications Dashboard
✅ One-Click Approve/Reject
✅ SHAP-Explained Credit Reports
✅ Compliance Audit Trail
✅ Portfolio Analytics
✅ Risk Heatmap

### Platform Features
✅ New-to-Credit Fairness (NTC engine)
✅ Alternate Data Sources (GST, UPI, bank, EPFO)
✅ RBI AA Compliant
✅ OCEN Integration
✅ Docker Ready
✅ Production Grade

---

## 🧪 Quick Test

```bash
# Terminal 1: Start the app
docker-compose up

# Terminal 2: Open in browser
http://localhost:3000

# Click "Try Live Demos" (no login needed)
# Or register as owner/manager to test full flow
```

---

## 📊 Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind |
| Backend | FastAPI, SQLAlchemy, MySQL |
| Auth | JWT (HS256), bcryptjs |
| DevOps | Docker, docker-compose, nginx |
| ML-Ready | XGBoost, SHAP for explainability |

---

## 🔐 Security

✅ JWT authentication
✅ Password hashing (bcryptjs)
✅ HTTPS-ready
✅ RBI AA compliant
✅ Audit logging
✅ SQL injection protection
✅ CORS configured

---

## 📱 Responsive Design

Works on mobile (320px+), tablet (768px+), desktop (1024px+)

---

## 📄 License

MIT License

---

**Status: SUBMISSION READY ✅**
Built for IDBI Innovate 2026
