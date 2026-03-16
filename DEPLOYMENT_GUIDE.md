# 🚀 Full Stack Deployment Guide

**Project**: CBSWENG--ProjectName-  
**Backend Deployed to**: Railway  
**Frontend Deploying to**: Vercel  
**Database**: PostgreSQL (Supabase via Railway)

---

## Current Status

### ✅ Backend (Railway)

- **URL**: `https://cbsweng-projectname-production.up.railway.app`
- **Status**: Live and configured
- **Health Check**: `https://cbsweng-projectname-production.up.railway.app/health`

### ⏳ Frontend (Ready for Vercel)

- **Configuration**: Complete
- **API Integration**: Centralized in `src/config/api.js`
- **Environment**: Ready for production

---

## What Was Configured

### Backend Improvements

- ✅ Production CORS settings
- ✅ Error handling middleware
- ✅ Health check endpoint
- ✅ Environment variables support
- ✅ Database migration automation
- ✅ Centralized Prisma client

### Frontend Setup

- ✅ Environment variable system (`.env`, `.env.production`)
- ✅ Centralized API configuration (`src/config/api.js`)
- ✅ Updated all 6+ components to use API config
- ✅ `.gitignore` configured
- ✅ Vite proxy setup
- ✅ Ready for Vercel

---

## Deployment Steps

### Frontend Deployment to Vercel

#### Step 1: Commit and Push

```bash
cd frontend
git add .
git commit -m "Configure frontend for Vercel deployment with Railway backend"
git push origin main
```

#### Step 2: Go to Vercel

1. Visit [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New"** → **"Project"**

#### Step 3: Import Repository

1. Find and select `CBSWENG--ProjectName-`
2. Set **Root Directory** to: `frontend`
3. Click **"Deploy"**

#### Step 4: Wait for Deployment

- Vercel shows real-time build logs
- Once complete, you'll get a URL like: `https://cbsweng-projectname.vercel.app`

#### Step 5: Update Backend CORS

Your backend needs to know your Vercel URL for CORS:

1. Go to [railway.app](https://railway.app)
2. Find your project → click backend service
3. Go to **Variables**
4. Update `FRONTEND_URL` to your Vercel URL (from step 4)
5. Click **Redeploy**

---

## Verify Everything Works

### Test Backend

```bash
curl https://cbsweng-projectname-production.up.railway.app/health
# Expected response: {"status":"OK","environment":"production"}
```

### Test Frontend API Connection

1. Open your Vercel frontend URL
2. Open browser console (F12)
3. Go to any page that fetches data
4. Check Network tab to confirm requests go to Railway backend
5. Look for successful responses

### Endpoints Tested

- `GET /health` - Backend health check
- `GET /posts/approved` - Get approved posts
- `GET /posts` - Get all posts
- `POST /posts` - Create post
- And other routes in your backend

---

## File Structure Summary

```
PROJECT/
├── backend/
│   ├── .env (⚠️ NOT in git)
│   ├── .env.example
│   ├── DEPLOYMENT.md
│   ├── server.js (production-ready)
│   ├── prisma/
│   │   └── schema.prisma
│   ├── controllers/
│   ├── routes/
│   └── ...
│
└── frontend/
    ├── .env (development)
    ├── .env.production (GitHub-tracked)
    ├── .env.example
    ├── .gitignore
    ├── DEPLOYMENT.md
    ├── src/
    │   ├── config/
    │   │   └── api.js (centralized API config) ⭐
    │   ├── pages/
    │   ├── components/
    │   └── ...
    └── vite.config.js

```

---

## Environment Variables

### Backend (Railway)

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://... (auto-set by Railway)
DIRECT_URL=postgresql://... (auto-set by Railway)
FRONTEND_URL=https://your-vercel-url.vercel.app
```

### Frontend Development

```
VITE_API_URL=http://localhost:3000
VITE_ENV=development
```

### Frontend Production (Vercel)

```
VITE_API_URL=https://cbsweng-projectname-production.up.railway.app
VITE_ENV=production
```

---

## How API Calls Work

### Before

❌ Direct hardcoded URLs:

```javascript
fetch("http://localhost:3000/posts");
fetch("http://localhost:3000/posts/approved");
```

### Now

✅ Centralized configuration:

```javascript
import { getApiUrl, apiFetch } from "./config/api";

const data = await apiFetch(getApiUrl("/posts/approved"));
```

**Benefits**:

- Single environment-aware URL source
- Easy to update if backend changes
- Works seamlessly in dev and production
- Built-in error handling

---

## Troubleshooting Quick Guide

| Issue              | Solution                                         |
| ------------------ | ------------------------------------------------ |
| "Cannot reach API" | Ensure `.env.production` has correct Railway URL |
| CORS errors        | Update `FRONTEND_URL` in Railway and redeploy    |
| Blank Vercel page  | Check Vercel deployment logs                     |
| API returning 404  | Verify endpoint exists in backend routes         |
| Database errors    | Check Railway PostgreSQL logs                    |

---

## Timeline

- ✅ Backend configured for production
- ✅ Backend deployed to Railway (LIVE)
- ✅ Frontend configured for Vercel
- ⏳ **Next**: Deploy frontend to Vercel
- ⏳ **Then**: Verify end-to-end functionality

---

## Quick Command Reference

```bash
# Backend
cd backend
npm install
npm start

# Frontend Development
cd frontend
npm install
npm run dev

# Frontend Production Build
cd frontend
npm run build
npm run preview

# Test Backend Health
curl https://cbsweng-projectname-production.up.railway.app/health
```

---

## Support

**For Backend Issues**:

- Check Railway logs: Dashboard → Project → Logs
- Verify environment variables in Railway → Variables

**For Frontend Issues**:

- Check Vercel logs: Vercel Dashboard → Project → Deployments
- Check browser console (F12) for client-side errors

**For CORS Issues**:

- Ensure `FRONTEND_URL` in Railway matches your Vercel URL
- Redeploy backend after updating

---

## Next Steps

1. **Push frontend changes to GitHub**

   ```bash
   git add .
   git commit -m "Setup frontend for Vercel deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to vercel.com
   - Import repository
   - Set root directory to `frontend`
   - Wait for deployment

3. **Get your Vercel URL** (automatically assigned)

4. **Update Backend CORS**
   - Railway dashboard
   - Update `FRONTEND_URL` variable
   - Redeploy

5. **Test Everything**
   - Test health endpoint
   - Test API calls from frontend
   - Verify all pages work

---

## Deployed URLs

| Component      | URL                                                            | Status             |
| -------------- | -------------------------------------------------------------- | ------------------ |
| Backend API    | `https://cbsweng-projectname-production.up.railway.app`        | ✅ Live            |
| Backend Health | `https://cbsweng-projectname-production.up.railway.app/health` | ✅ Live            |
| Frontend       | `https://your-frontend-url.vercel.app`                         | ⏳ Ready to deploy |
| Database       | Managed by Railway PostgreSQL                                  | ✅ Live            |

---

**Last Updated**: March 16, 2026  
**Version**: 1.0 - Initial Production Setup
