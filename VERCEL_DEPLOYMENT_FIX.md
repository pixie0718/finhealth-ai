# Vercel Deployment - 404 Error FIX ✓

**Problem:** Frontend deployed but getting 404 error  
**Root Cause:** Missing `vercel.json` + backend API not configured  
**Solution:** Split deployment (Frontend on Vercel + Backend on separate service)

---

## ✅ What I Fixed

1. **Created `vercel.json`** - Proper routing for React app
2. **Created `frontend/.env.production`** - API URL for production
3. **Added proper static file caching** - Better performance

---

## 🔧 Current Deployment Architecture

```
finhealth-ai.vercel.app
    ├── Frontend (React) ✅ ON VERCEL
    ├── API Calls → Backend API (NEEDS TO BE DEPLOYED)
    └── Database → TiDB Cloud (✅ ALREADY SET UP)
```

**The 404 error was because:** Vercel couldn't find the backend routes, and frontend routing wasn't configured.

---

## 🚀 STEP-BY-STEP FIX

### STEP 1: Re-deploy Frontend to Vercel
```bash
git add .
git commit -m "Fix Vercel deployment: add vercel.json and frontend .env"
git push origin main
```

**Vercel will auto-redeploy** (watch https://vercel.com/dashboard)

---

### STEP 2: Deploy Backend Separately
You have **3 options:**

#### Option A: Deploy to Railway (EASIEST) ⭐
1. Go to https://railway.app/
2. Click "New Project" → "Deploy from GitHub"
3. Select `finhealth-ai` repo
4. Railway auto-detects FastAPI, deploys automatically
5. Get backend URL (e.g., `https://finhealth-backend-production.railway.app`)

#### Option B: Deploy to Render (FREE)
1. Go to https://render.com/
2. "New +" → "Web Service" → Connect GitHub
3. Select `finhealth-ai` repo
4. Runtime: `python-3.11`
5. Build command: `pip install -r backend/requirements.txt`
6. Start command: `cd backend && uvicorn main:app --host 0.0.0.0 --port 8000`
7. Get backend URL

#### Option C: Deploy to Heroku (PAID but stable)
1. Go to https://www.heroku.com/
2. Create app → "Deploy from GitHub"
3. Select repo, deploy
4. Get backend URL

---

### STEP 3: Update Frontend to Use Backend URL

Once you have backend URL from Railway/Render, update:

**File: `frontend/.env.production`**
```
REACT_APP_API_URL=https://YOUR_BACKEND_URL_HERE
```

Example:
```
REACT_APP_API_URL=https://finhealth-backend-production.railway.app
```

**Then re-deploy frontend:**
```bash
git add frontend/.env.production
git commit -m "Update backend API URL for production"
git push origin main
```

---

### STEP 4: Update Vercel Environment Variables
Go to **Vercel Dashboard** → Your Project → Settings → Environment Variables

Add:
```
REACT_APP_API_URL = https://YOUR_BACKEND_URL
```

(This is redundant with .env.production but ensures it's set)

---

## 🧪 Test Everything

1. **Frontend:** https://finhealth-ai.vercel.app/
   - Should load the React app (NO 404)
   - Dark/light mode toggle works
   - Landing page displays

2. **Login:**
   - Go to `/owner/login`
   - Email: `owner@demo.com`
   - Password: `<redacted>`
   - Should fetch score from backend TiDB ✓

3. **API Health:**
   - Visit `https://YOUR_BACKEND_URL/docs`
   - Should see Swagger API documentation

---

## 📋 Environment Variables Needed

### Frontend (.env.production)
```
REACT_APP_API_URL=https://YOUR_BACKEND_URL
```

### Backend (.env on Railway/Render)
```
SECRET_KEY=<redacted — rotated, see Railway env vars>
DATABASE_URL=mysql+pymysql://<user>:<password>@<host>:4000/finhealth?ssl_verify_cert=true&ssl_verify_identity=true  # redacted — rotated
GEMINI_API_KEY=[optional]
```

---

## ✅ Files Created/Modified

**Created:**
- `vercel.json` - Frontend routing configuration
- `frontend/.env.production` - Production API URL

**NO BREAKING CHANGES** - all existing code unchanged

---

## 🎯 QUICK SUMMARY

| Step | What | Where | Status |
|------|------|-------|--------|
| 1 | Frontend on Vercel | https://finhealth-ai.vercel.app | ✅ DONE |
| 2 | vercel.json | Root directory | ✅ FIXED |
| 3 | Backend API | Railway/Render | 🔴 TODO |
| 4 | Connect Frontend→Backend | .env.production | 🔴 TODO |
| 5 | Test login | Demo account | 🔴 TODO |

---

## 🚨 Common Issues & Fixes

**Issue: Still getting 404**
- Solution: Hard refresh browser (Ctrl+Shift+R)
- Or clear Vercel cache: Dashboard → Settings → Purge

**Issue: API calls failing**
- Check: Frontend is sending API calls to correct backend URL
- Check: Backend has DATABASE_URL set correctly
- Check: Backend is actually deployed and running

**Issue: Login doesn't work**
- Check: Backend is accessible (visit /docs)
- Check: TiDB connection is working
- Check: Demo accounts exist in database

**Issue: Build failing on Vercel**
- Check: `frontend/package.json` build script works locally
- Check: No TypeScript errors
- Run: `npm run build` in frontend folder

---

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Railway App: https://railway.app/
- Render: https://render.com/
- TiDB Cloud: https://tidbcloud.com/

---

## 📞 NEED HELP?

If 404 persists after these steps:

1. Check Vercel logs: Dashboard → Your Project → Deployments → Latest → Logs
2. Check frontend build: Does `frontend/build/` exist with `index.html`?
3. Check backend: Is it accessible at the URL?
4. Check CORS: Does backend allow requests from Vercel frontend?

---

**Next Action: Choose Railway/Render for backend, deploy, update API URL, re-deploy frontend** 🚀
