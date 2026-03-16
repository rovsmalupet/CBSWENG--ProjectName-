# 📋 DEPLOYMENT SUMMARY - Share With Team

**Project**: CBSWENG--ProjectName-  
**Last Updated**: March 16, 2026  
**Status**: ✅ Fully Deployed

---

## 🌐 Live URLs

| Service          | URL                                                          | Status  |
| ---------------- | ------------------------------------------------------------ | ------- |
| **Backend API**  | https://cbsweng-projectname-production.up.railway.app        | ✅ Live |
| **Frontend**     | https://cbsweng-project-name-ddtf.vercel.app                 | ✅ Live |
| **Health Check** | https://cbsweng-projectname-production.up.railway.app/health | ✅ Live |

---

## 🔑 Backend Variables (Railway Dashboard)

**Location**: [railway.app](https://railway.app) → Project → Backend Service → Variables

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://... (auto-set by Railway)
DIRECT_URL=postgresql://... (auto-set by Railway)
FRONTEND_URL=https://cbsweng-project-name-ddtf.vercel.app
```

**⚠️ Important:**

- Never edit `.env` file directly in production
- Always update variables in Railway dashboard
- After updating, click **"Redeploy"** to apply changes

---

## ⚙️ Frontend Variables (Vercel Environment)

**Location**: [vercel.com](https://vercel.com) → Project → Settings → Environment Variables → Production

```
VITE_API_URL=https://cbsweng-projectname-production.up.railway.app
VITE_ENV=production
```

**Local Development** (`.env` file):

```
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

---

## 📡 API Endpoints Reference

All endpoints start with: **`https://cbsweng-projectname-production.up.railway.app`**

### Posts

```
GET    /posts                    - Get all posts
GET    /posts/approved          - Get only approved posts
POST   /posts                   - Create new post
GET    /posts/:id               - Get single post details
PUT    /posts/:id               - Update post
PATCH  /posts/:id/status        - Change post status
DELETE /posts/:id               - Delete post
```

### Organizations

```
GET    /organizations/pending                    - Get pending orgs
PATCH  /organizations/:id/approve               - Approve org
PATCH  /organizations/:id/reject                - Reject org
```

### Health & Status

```
GET    /health                  - Backend status check
Response: {"status":"OK","environment":"production"}
```

---

## 🚀 How to Deploy Changes

### Backend (Node.js + Express + PostgreSQL)

**Step 1**: Make changes locally

```bash
cd backend
# Edit files...
npm run dev  # Test locally
```

**Step 2**: Commit and push

```bash
git add .
git commit -m "Your descriptive message"
git push origin main
```

**Step 3**: Railway auto-deploys

- Check [railway.app](https://railway.app) dashboard
- Logs show deployment progress
- Takes 1-2 minutes usually

**Step 4**: Verify

```bash
curl https://cbsweng-projectname-production.up.railway.app/health
```

### Frontend (React + Vite)

**Step 1**: Make changes locally

```bash
cd frontend
npm run dev  # Test on http://localhost:5173
```

**Step 2**: Commit and push

```bash
git add .
git commit -m "Your descriptive message"
git push origin main
```

**Step 3**: Vercel auto-deploys

- Check [vercel.com](https://vercel.com) dashboard
- Builds and deploys automatically
- Takes 1-2 minutes usually

**Step 4**: Test

- Visit https://cbsweng-project-name-ddtf.vercel.app
- Check browser console (F12) for errors

---

## 🔐 Security Best Practices

### Do NOT commit these:

- `.env` files with credentials
- Database passwords
- API keys
- Secret tokens

### Always use:

- GitHub `.gitignore` to exclude `.env`
- Railway/Vercel dashboard for sensitive variables
- Environment-specific config files

### `.gitignore` includes:

```
.env
.env.local
node_modules/
dist/
.DS_Store
```

---

## 📁 Project Structure

```
CBSWENG--ProjectName-/
├── backend/
│   ├── .env (❌ NOT in git)
│   ├── .env.example ✅
│   ├── server.js (production-ready)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── client.js
│   │   └── migrations/
│   ├── controllers/
│   ├── routes/
│   └── package.json
│
└── frontend/
    ├── .env (development)
    ├── .env.production (for Vercel)
    ├── .env.example ✅
    ├── src/
    │   ├── config/
    │   │   └── api.js ⭐ (centralized API URLs)
    │   ├── pages/
    │   ├── components/
    │   └── App.jsx
    └── vite.config.js
```

---

## ⚡ Quick Troubleshooting

### "Cannot reach API" / 404 errors

- ✅ Check backend is running: `curl https://cbsweng-projectname-production.up.railway.app/health`
- ✅ Check `VITE_API_URL` is correct in Vercel
- ✅ Redeploy frontend on Vercel

### "CORS error"

- ✅ Go to Railway dashboard
- ✅ Update `FRONTEND_URL` to match Vercel domain
- ✅ Click **"Redeploy"** backend
- ✅ Wait 2-3 minutes

### "Build failed" on Vercel

- ✅ Check [vercel.com](https://vercel.com) → Deployments → Logs
- ✅ Look for errors in build log
- ✅ Common: Case-sensitivity issues, missing imports

### "Network error" on page load

- ✅ Open browser console (F12)
- ✅ Check Network tab for API call failures
- ✅ Verify API URLs in code use `getApiUrl()` from `config/api.js`

---

## 🗄️ Database Info

| Property   | Value                          |
| ---------- | ------------------------------ |
| Type       | PostgreSQL                     |
| Host       | Managed by Railway             |
| Provider   | Supabase                       |
| Migrations | Auto-run on deploy             |
| Schema     | `backend/prisma/schema.prisma` |

**To access database**:

1. Go to [railway.app](https://railway.app)
2. Click project → PostgreSQL service
3. View data, run queries

---

## 📊 Current Deployment Status

| Component   | Platform                          | Status       | URL                                                   |
| ----------- | --------------------------------- | ------------ | ----------------------------------------------------- |
| Backend     | Railway                           | ✅ Live      | https://cbsweng-projectname-production.up.railway.app |
| Frontend    | Vercel                            | ✅ Live      | https://cbsweng-project-name-ddtf.vercel.app          |
| Database    | Railway + PostgreSQL              | ✅ Live      | Managed by Railway                                    |
| GitHub Repo | rovsmalupet/CBSWENG--ProjectName- | ✅ Connected | Main branch auto-deploys                              |

---

## 📞 Support & Next Steps

### If you encounter issues:

1. Check this guide first
2. Check browser console (F12) for error messages
3. Check deployment logs:
   - Railway: Dashboard → Logs
   - Vercel: Dashboard → Deployments → View Build Logs
4. Ask team members

### To make new features:

1. Create a new branch: `git checkout -b feature-name`
2. Make changes and test locally
3. Push: `git push origin feature-name`
4. Create Pull Request on GitHub
5. Merge to `main` when approved
6. Auto-deploys to production

---

## 🎯 Summary for Groupmates

✅ **Backend is live** - All API endpoints working  
✅ **Frontend is live** - UI accessible at Vercel URL  
✅ **Database connected** - All data persistent  
✅ **Auto-deployment** - Push to main = automatic deploy  
✅ **Security configured** - No secrets in GitHub

**You can start using the app now!** 🚀

For questions, refer to the detailed guides in `backend/DEPLOYMENT.md` and `frontend/DEPLOYMENT.md`
