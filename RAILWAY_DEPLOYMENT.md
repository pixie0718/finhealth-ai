# Railway Backend Deployment Guide

**Status:** Backend deployment fixed for Railway  
**Previous Error:** Build failed (Dockerfile not found)  
**Solution:** Added root-level Dockerfile + railway.json

---

## ✅ What I Fixed

1. **Created `/Dockerfile`** - Root-level Docker config for Railway
2. **Created `/Procfile`** - Process file for Railway CLI
3. **Created `/railway.json`** - Railway deployment config
4. **Created `/.dockerignore`** - Optimized build context

---

## 🚀 Deploy to Railway (Step-by-Step)

### Step 1: Delete Previous Failed Deployment
1. Go to https://railway.app/dashboard
2. Click on your project `finhealth-ai`
3. Click "Services" → Select the failed deployment
4. Click "Settings" → "Delete Service"
5. Confirm deletion

### Step 2: Re-deploy from GitHub
1. Go to your project
2. Click "New" → "Service" → "GitHub Repo"
3. Select `finhealth-ai` repo
4. Select branch: `main`
5. Click "Deploy Now"

Railway will now:
- Find the Dockerfile ✓
- Build the backend ✓
- Start the service ✓

### Step 3: Set Environment Variables
Once deployed, click on the service → Settings → "Variables"

Add these environment variables:
```
DATABASE_URL = mysql+pymysql://<user>:<password>@<host>:4000/finhealth?ssl_verify_cert=true&ssl_verify_identity=true  # redacted — rotated

SECRET_KEY = <redacted — rotated, see Railway env vars>

GEMINI_API_KEY = [optional, leave blank if not needed]
```

**IMPORTANT:** After setting variables, click "Redeploy" for them to take effect.

### Step 4: Get Backend URL
1. Go to your service settings
2. Look for "Domains" section
3. Copy the domain (e.g., `https://finhealth-backend-production.up.railway.app`)
4. This is your `BACKEND_URL`

### Step 5: Test Backend
Visit: `https://YOUR_BACKEND_URL/docs`

Should see Swagger API documentation ✓

### Step 6: Update Frontend
Go to Vercel Dashboard → Settings → Environment Variables

Update:
```
REACT_APP_API_URL = https://YOUR_BACKEND_URL
```

Then trigger a redeploy (push to GitHub or manually in Vercel)

---

## 🔍 Troubleshooting

### Build Still Failing?
1. Check logs: Railway Dashboard → Service → Logs
2. Look for Python errors or missing dependencies
3. Verify: `backend/requirements.txt` exists and is valid

### Application Not Starting?
1. Check "Deploy Logs" for startup errors
2. Verify DATABASE_URL is correct
3. Verify SECRET_KEY is set
4. Check if port 8000 is being used

### API Returns 502 Bad Gateway?
- Service might be crashing
- Check Railway Logs for errors
- Verify DATABASE_URL points to TiDB correctly

### Cannot Connect to TiDB?
- TiDB IP whitelist: Allow "0.0.0.0/0" (all IPs) for development
- OR Railway deployment might be restricted by TiDB firewall
- Go to TiDB Cloud Dashboard → Security → IP Whitelist → Add Railway's IP range

---

## 📋 Expected Output

**When deployment succeeds, you should see:**
```
✓ Building Docker image...
✓ Pushing image to registry...
✓ Deploying service...
✓ Service started successfully
✓ Available at: https://finhealth-backend-xxxxx.up.railway.app
```

---

## 🔗 Useful Links

- Railway Dashboard: https://railway.app/dashboard
- Service Logs: In your project → Service → Logs tab
- Domains: In your service settings

---

## ✅ Deployment Checklist

- [ ] Previous deployment deleted
- [ ] New deployment initiated from GitHub
- [ ] Dockerfile found and built ✓
- [ ] Environment variables set (DATABASE_URL, SECRET_KEY)
- [ ] Service deployed successfully
- [ ] Backend URL obtained
- [ ] API docs accessible at `/docs`
- [ ] Frontend updated with backend URL
- [ ] Frontend re-deployed to Vercel
- [ ] Login test with demo account works

---

## 🎯 Current Architecture (After This Fix)

```
finhealth-ai.vercel.app (Frontend)
        ↓ API Calls
https://finhealth-backend-xxxxx.up.railway.app (Backend)
        ↓ Database
TiDB Cloud (finhealth database)
```

---

**Next Step:** Delete the failed Railway deployment and re-deploy with the new Dockerfile ✓
