# Frontend Deployment Guide

## Setting Up for Vercel Deployment

### Prerequisites

- Your backend is deployed to Railway: `https://cbsweng-projectname-production.up.railway.app`
- Vercel account (sign up at https://vercel.com)
- GitHub repository connected

---

## Environment Configuration

### Development Environment

The frontend is configured to work with the local backend:

- **File**: `.env`
- **API URL**: `http://localhost:3000`

### Production Environment

For Vercel deployment, the production environment is automatically used:

- **File**: `.env.production`
- **API URL**: `https://cbsweng-projectname-production.up.railway.app`

**Important**: When you deploy to Vercel, it will automatically use `.env.production` variables.

---

## Deploying to Vercel

### Step 1: Push Changes to GitHub

```bash
git add .
git commit -m "Configure frontend for production deployment"
git push origin main
```

### Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### Step 3: Import Project

1. Click **"Add New..."** → **"Project"**
2. Select your repository: `CBSWENG--ProjectName-`
3. Select **"frontend"** as the root directory (if not auto-detected)
4. Click **"Deploy"**

### Step 4: Configure Environment Variables (if needed)

In Vercel dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add the production variables (usually pre-filled from `.env.production`):
   - `VITE_API_URL`: `https://cbsweng-projectname-production.up.railway.app`
   - `VITE_ENV`: `production`

### Step 5: Deploy

Vercel will automatically:

1. Install dependencies
2. Build the project (`npm run build`)
3. Deploy to live URL

Your frontend will be available at: `https://your-project-name.vercel.app`

---

## API Configuration System

### How It Works

The frontend uses a centralized API configuration in `src/config/api.js`:

**File**: [src/config/api.js](src/config/api.js)

```javascript
import { getApiUrl, apiFetch } from "./config/api";

// Use in components:
const data = await apiFetch(getApiUrl("/posts/approved"));
```

**Benefits**:

- ✅ Single source of truth for API URL
- ✅ Automatically switches between dev/prod environments
- ✅ Centralized error handling
- ✅ Easy to update if backend URL changes

### Environment Variables

**Development** (`.env`):

```
VITE_API_URL=http://localhost:3000
```

**Production** (`.env.production`):

```
VITE_API_URL=https://cbsweng-projectname-production.up.railway.app
```

---

## Common Issues & Troubleshooting

### "Cannot reach API" Error

**Cause**: Frontend is trying to reach localhost in production  
**Fix**: Ensure `.env.production` has the correct Railway URL

### CORS Error

**Cause**: Backend CORS not configured to accept Vercel URL  
**Fix**: Update `FRONTEND_URL` in Railway variables:

1. Go to Railway dashboard
2. Find your backend project
3. Go to **Variables**
4. Update `FRONTEND_URL` to your Vercel URL (e.g., `https://your-project-name.vercel.app`)
5. Click **Redeploy**

### Blank Page on Vercel

**Cause**: Build might have failed or wrong root directory selected  
**Fix**:

1. Check Vercel logs: Click **"Deployments"** → click deployment → **"Logs"**
2. Verify root directory is set to `frontend`
3. Check that all dependencies installed correctly

### API Calls Still Using `http://localhost:3000`

**Cause**: Old fetch calls not updated  
**Fix**: Ensure all fetch calls use the API config:

```javascript
// ✅ Correct
const { getApiUrl, apiFetch } = await import("../config/api");
const data = await apiFetch(getApiUrl("/posts"));

// ❌ Wrong
const data = await fetch("http://localhost:3000/posts");
```

---

## After Deployment

### Test Your Live Frontend

1. Go to your Vercel URL: `https://your-project-name.vercel.app`
2. Test all features that call the backend
3. Check browser console for errors (F12 → Console tab)

### Monitor for Issues

1. Vercel dashboard shows real-time logs
2. Check if backend is responding: `https://cbsweng-projectname-production.up.railway.app/health`

### Update Backend URL

If backend URL changes in the future:

1. Update `.env.production` locally
2. Push to GitHub
3. Vercel automatically redeploys

---

## Frontend Build Optimization

The frontend is already optimized for production:

- ✅ React 19.2 with latest features
- ✅ Vite for fast builds
- ✅ Code splitting via React Router
- ✅ CSS optimization

No additional configuration needed!

---

## Next Steps

1. ✅ Push changes to GitHub
2. ✅ Connect repository to Vercel
3. ✅ Deploy frontend
4. ✅ Test with live backend
5. ✅ Share deployed URL with team
