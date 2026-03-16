# 🌐 Frontend Deployment - Vercel Quick Guide

**Project**: CBSWENG--ProjectName-  
**Deployed At**: https://cbsweng-project-name-ddtf.vercel.app  
**Platform**: Vercel  
**Framework**: React 19 + Vite

---

## ✅ Current Status

| Item          | Status        | Value                                                 |
| ------------- | ------------- | ----------------------------------------------------- |
| Frontend      | ✅ Live       | https://cbsweng-project-name-ddtf.vercel.app          |
| API Connected | ✅ Working    | https://cbsweng-projectname-production.up.railway.app |
| Build         | ✅ Automatic  | Deploys on `git push` to main                         |
| Environment   | ✅ Configured | Production variables set                              |

---

## 🔧 Environment Configuration

### Production (Vercel Dashboard)

**Location**: [vercel.com](https://vercel.com) → cbsweng-project-name → Settings → Environment Variables

```
VITE_API_URL=https://cbsweng-projectname-production.up.railway.app
VITE_ENV=production
```

### Development (Local `.env`)

```
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

---

## 🚀 Making Changes & Deploying

### Quick Deploy Cycle

**1. Make your changes locally:**

```bash
cd frontend
npm run dev
# Test on http://localhost:5173
```

**2. Commit and push:**

```bash
git add .
git commit -m "Add feature: description"
git push origin main
```

**3. Vercel auto-deploys**

- Automatically builds when detecting push to main
- Takes 1-2 minutes
- No manual action needed!

**4. Check deployment:**

- Visit https://cbsweng-project-name-ddtf.vercel.app
- Open console (F12) to check for errors

---

## 📦 Project Structure

```
frontend/
├── src/
│   ├── config/
│   │   └── api.js ⭐ (centralized API calls)
│   ├── pages/
│   │   ├── ActiveProjects.jsx
│   │   ├── DonorHomepage.jsx
│   │   ├── AdminHomepage.jsx
│   │   ├── EditProject.jsx
│   │   └── ... (other pages)
│   ├── components/
│   ├── css/
│   ├── App.jsx
│   └── main.jsx
├── .env (local development)
├── .env.production (for Vercel)
├── .gitignore
├── vite.config.js
└── package.json
```

### Key File: `src/config/api.js`

This is where all API URLs are centralized. All pages use:

```javascript
import { getApiUrl, apiFetch } from "./config/api";
const data = await apiFetch(getApiUrl("/posts/approved"));
```

---

## 🔗 Available API Endpoints

All endpoints from: `https://cbsweng-projectname-production.up.railway.app`

```
GET  /posts                   - All posts
GET  /posts/approved          - Approved posts only
POST /posts                   - Create post
GET  /posts/:id               - Get single post
PUT  /posts/:id               - Update post
GET  /organizations/pending   - Pending orgs
```

---

## 🌳 Component Pages

| Page                 | Route                     | User  | Status |
| -------------------- | ------------------------- | ----- | ------ |
| Login                | `/login`                  | All   | ✅     |
| Donor Homepage       | `/donor`                  | Donor | ✅     |
| Active Projects      | `/project-ledger`         | Donor | ✅     |
| Project Detail       | `/project/:id`            | Donor | ✅     |
| Bookmarked           | `/donor/bookmarks`        | Donor | ✅     |
| Add Contribution     | `/add-contribution/:id`   | Donor | ✅     |
| Admin Dashboard      | `/admin`                  | Admin | ✅     |
| View All Posts       | `/viewProjects`           | Admin | ✅     |
| Admin Project Detail | `/admin/project/:id`      | Admin | ✅     |
| Post New Project     | `/post-project`           | Org   | ✅     |
| Edit Project         | `/edit-project/:id`       | Org   | ✅     |
| Unapproved Projects  | `/unposted-projects`      | Admin | ✅     |
| Pending Accounts     | `/admin/pending-accounts` | Admin | ✅     |

---

## 🔍 Common Issues & Fixes

### "Cannot reach API" / 404 errors

**Problem**: Frontend can't connect to backend  
**Fix**:

1. Check backend is running: `curl https://cbsweng-projectname-production.up.railway.app/health`
2. Verify `VITE_API_URL` in Vercel settings
3. Redeploy frontend

### "CORS error" in console

**Problem**: Backend rejected request from frontend domain  
**Fix**:

1. Go to [railway.app](https://railway.app)
2. Update backend `FRONTEND_URL` to `https://cbsweng-project-name-ddtf.vercel.app`
3. Click **"Redeploy"** backend
4. Wait 2-3 minutes
5. Reload frontend page

### "Blank page" or build errors

**Problem**: Vercel build failed  
**Fix**:

1. Check Vercel logs: [vercel.com](https://vercel.com) → Deployments → click latest → Logs
2. Look for build errors
3. Common causes: syntax errors, missing imports, case-sensitivity
4. Fix locally and push again

### "Network error" when loading data

**Problem**: Page calls API but fails  
**Fix**:

1. Open browser console: F12 → Console tab
2. Look for error messages
3. Check Network tab → find failing request
4. Verify API endpoint exists
5. Ensure using `getApiUrl()` helper

---

## 📝 Code Best Practices

### ✅ DO - Use API Config

```javascript
import { getApiUrl, apiFetch } from "../config/api";

const data = await apiFetch(getApiUrl("/posts/approved"));
```

### ❌ DON'T - Hardcode URLs

```javascript
// Wrong! Won't work in production
const data = await fetch("http://localhost:3000/posts");
```

### ✅ DO - Use Environment Variables

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

### ❌ DON'T - Hardcode in code

```javascript
// Wrong! Won't work when deployed
const apiUrl = "https://specific-url.com";
```

---

## 🚢 Deployment Checklist

Before pushing to production, verify:

- [ ] Code works locally: `npm run dev`
- [ ] No console errors (F12)
- [ ] API calls working
- [ ] All pages load
- [ ] Forms submit correctly
- [ ] No hardcoded URLs
- [ ] Using `getApiUrl()` helper
- [ ] No `.env` file will be committed

---

## 📊 Build & Performance

| Metric       | Value             |
| ------------ | ----------------- |
| Build Time   | ~2 minutes        |
| Bundle Size  | Optimized by Vite |
| Framework    | React 19 + Vite 7 |
| Hosting      | Vercel Global CDN |
| HTTPS        | ✅ Automatic      |
| Auto-scaling | ✅ Automatic      |

---

## 🔐 Security

**What's protected:**

- ✅ All API endpoints behind backend validation
- ✅ CORS properly configured
- ✅ No credentials in frontend code
- ✅ No secrets in GitHub

**What to avoid:**

- ❌ Storing tokens in plain text
- ❌ Committing `.env` files
- ❌ Hardcoding API keys
- ❌ Committing passwords

---

## 📚 Additional Commands

```bash
# Local development
npm run dev              # Start dev server on localhost:5173

# Production build
npm run build            # Creates dist/ folder
npm run preview          # Preview production build locally

# Linting
npm run lint             # Check for code issues

# Install dependencies
npm install              # After cloning or package.json changes
```

---

## 🎯 Summary

✅ **Frontend is deployed** on Vercel  
✅ **Auto-deploys** on GitHub push  
✅ **Connected to backend** via Railway  
✅ **Ready for production** use

**To add new features:**

1. Create branch locally
2. Make changes
3. Test locally
4. Push to GitHub
5. Auto-deploys to Vercel
6. Done! 🚀

---

## 📞 Need Help?

Check the troubleshooting section above, or see the detailed guides:

- `TEAM_DEPLOYMENT_SUMMARY.md` - Overall deployment overview
- `backend/DEPLOYMENT.md` - Backend-specific deployment

---

**Last Updated**: March 16, 2026  
**Status**: ✅ Production Ready
