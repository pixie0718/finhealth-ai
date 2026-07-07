# TiDB Migration - COMPLETE ✓

**Date:** 2026-07-07  
**Status:** ✅ READY FOR VERCEL DEPLOYMENT

---

## Migration Summary

### What Was Done

1. **Database Created:** `finhealth` on TiDB Cloud
   - Host: `gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000`
   - User: `45YQw5GHn42CMte.root`

2. **Tables Created (8 total):**
   - ✅ users
   - ✅ scores
   - ✅ score_snapshots
   - ✅ consent_artifacts
   - ✅ loan_outcomes
   - ✅ loan_applications
   - ✅ audit_logs
   - ✅ benchmark_cache

3. **Demo Data Seeded:**
   - ✅ 2 Demo Users (Owner + Manager)
   - ✅ 1 Demo Score (Growth Star - Score 84)
   - ✅ 1 Demo Loan Application (₹25L MUDRA)

4. **Fixed for TiDB Compatibility:**
   - ✅ All VARCHAR columns now have length (e.g., VARCHAR(255))
   - ✅ Added pymysql to requirements.txt
   - ✅ Using MySQL dialect with SSL verification

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Owner | `owner@demo.com` | `Demo123` |
| Manager | `manager@demo.com` | `Demo123` |

**Test Scenario:** Growth Star (Sharma Textiles - Score 84, LOW risk)

---

## Configuration Files Updated

### backend/.env
```
SECRET_KEY=2M2pBgsdbwlsxdMU4HLPQ5HqsWUybonQvlC3h-407zL0YsuE0jKYflqXCEU02Q6-
GEMINI_API_KEY=
DATABASE_URL=mysql+pymysql://45YQw5GHn42CMte.root:AlvrFGDTt16kjnLx@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/finhealth?ssl_verify_cert=true&ssl_verify_identity=true
```

### backend/requirements.txt
- ✅ Added: `pymysql>=1.1.0`
- ✅ Added: `argon2-cffi` (for password hashing)

### backend/database.py
- ✅ Updated all String() columns to include VARCHAR length
- ✅ Models compatible with TiDB MySQL 8.0

---

## Next Steps for Vercel Deployment

### 1. Test Locally First
```bash
cd backend
uvicorn main:app --reload
# Visit http://localhost:8000/docs
```

### 2. Test Login with Demo Account
- Go to http://localhost:3000/owner/login
- Email: `owner@demo.com`
- Password: `Demo123`
- Should see growth star demo score

### 3. Set Vercel Environment Variables
In Vercel dashboard for your project:
```
DATABASE_URL=mysql+pymysql://45YQw5GHn42CMte.root:AlvrFGDTt16kjnLx@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/finhealth?ssl_verify_cert=true&ssl_verify_identity=true
SECRET_KEY=2M2pBgsdbwlsxdMU4HLPQ5HqsWUybonQvlC3h-407zL0YsuE0jKYflqXCEU02Q6-
GEMINI_API_KEY=[your API key if available]
```

### 4. Deploy to Vercel
```bash
git add .
git commit -m "Migrate database to TiDB Cloud for production"
git push origin main
# Vercel auto-deploys on push
```

---

## Important Security Notes

🔒 **CAREFUL:** These credentials are in .env (gitignored) but also in Vercel's environment variables.
- Keep DATABASE_URL secure (it contains password)
- Never commit .env to git
- Verify .gitignore includes `.env`

---

## Safety Verification

✅ **What was NOT touched:**
- Your other TiDB databases (test database untouched)
- Any other projects in your TiDB instance
- Only created new `finhealth` database

✅ **What is safe to do:**
- Commit all code changes
- Deploy to Vercel anytime
- Add more demo data if needed
- Modify tables later (migrations using SQLAlchemy)

---

## Troubleshooting

### Issue: "Can't connect to TiDB from Vercel"
**Solution:** TiDB cloud needs your Vercel IPs whitelisted, OR use IP whitelist "*" for development

### Issue: "Tables not found on Vercel"
**Solution:** Run `python migrate_to_tidb.py` before deploying, OR add to Vercel build step:
```json
"buildCommand": "cd backend && python migrate_to_tidb.py"
```

### Issue: "Demo password not working"
**Password:** `Demo123` (not Demo@123456)

---

## Files Modified

1. `/backend/.env` - Added DATABASE_URL
2. `/backend/requirements.txt` - Added pymysql, argon2-cffi
3. `/backend/database.py` - Fixed VARCHAR lengths for TiDB
4. `/backend/migrate_to_tidb.py` - Migration script (created)

---

## Status: READY FOR DEPLOYMENT ✓

Next: Test locally, then deploy to Vercel!
