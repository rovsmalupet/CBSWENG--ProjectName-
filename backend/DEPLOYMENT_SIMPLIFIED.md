# 🔧 Backend Deployment - Railway Quick Guide

**Project**: CBSWENG--ProjectName-  
**Live URL**: https://cbsweng-projectname-production.up.railway.app  
**Platform**: Railway (Node.js + Express + PostgreSQL)

---

## ✅ Current Status

| Component    | Status       | Value                                                 |
| ------------ | ------------ | ----------------------------------------------------- |
| Backend API  | ✅ Live      | https://cbsweng-projectname-production.up.railway.app |
| Health Check | ✅ Working   | Returns `{"status":"OK"}`                             |
| Database     | ✅ Connected | PostgreSQL via Railway                                |
| Auto-Deploy  | ✅ Enabled   | Deploys on main branch push                           |

---

## 🔑 Environment Variables (Railway Dashboard)

**Location**: [railway.app](https://railway.app) → Project → Backend → Variables

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://... (auto by Railway)
DIRECT_URL=postgresql://... (auto by Railway)
FRONTEND_URL=https://cbsweng-project-name-ddtf.vercel.app
```

**⚠️ Important**:

- Never commit `.env` file to GitHub
- All env vars stored in Railway dashboard
- After updating, click **"Redeploy"**

---

## 🚀 Making Changes & Deploying

### Quick Deploy Cycle

**1. Make your changes locally:**

```bash
cd backend
npm run dev
# Test on http://localhost:3000
```

**2. Test the health endpoint:**

```bash
curl http://localhost:3000/health
# Should return: {"status":"OK","environment":"development"}
```

**3. Commit and push:**

```bash
git add .
git commit -m "Add feature: description"
git push origin main
```

**4. Railway auto-deploys**

- Detects push to main automatically
- Runs build: `npm install && npx prisma generate`
- Takes 2-3 minutes

**5. Verify deployment:**

```bash
curl https://cbsweng-projectname-production.up.railway.app/health
```

---

## 📦 Project Structure

```
backend/
├── server.js ⭐ (main entry point)
├── prisma/
│   ├── client.js (centralized DB connection)
│   ├── schema.prisma (database schema)
│   └── migrations/ (database versions)
├── routes/
│   ├── postRoutes.js
│   └── organizationRoutes.js
├── controllers/
│   ├── postController.js
│   └── organizationController.js
├── .env (❌ NOT in git - local only)
├── .env.example ✅
├── .gitignore
└── package.json
```

---

## 🔗 API Endpoints

All at: `https://cbsweng-projectname-production.up.railway.app`

### Health Check

```
GET /health
Response: {"status":"OK","environment":"production"}
```

### Posts

```
GET    /posts                   - All posts
GET    /posts/approved          - Only approved
POST   /posts                   - Create new
GET    /posts/:id               - Get one
PUT    /posts/:id               - Update
PATCH  /posts/:id/status        - Change status
DELETE /posts/:id               - Delete
```

### Organizations

```
GET    /organizations/pending           - Pending orgs
PATCH  /organizations/:id/approve       - Approve
PATCH  /organizations/:id/reject        - Reject
```

---

## 🗄️ Database

| Property     | Value              |
| ------------ | ------------------ |
| Type         | PostgreSQL         |
| Host         | Managed by Railway |
| Accessed Via | Vercel auto-config |
| Migrations   | Auto-run on deploy |

**To manage database:**

1. Go to [railway.app](https://railway.app)
2. Click project → PostgreSQL service
3. View/edit data

---

## 🔧 Updating Frontend URL (CORS Fix)

When frontend URL changes (e.g., new Vercel deployment):

**1. Go to Railway dashboard**

```
[railway.app](https://railway.app) → Project → Backend Service → Variables
```

**2. Update `FRONTEND_URL`**

```
Old: https://old-url.vercel.app
New: https://cbsweng-project-name-ddtf.vercel.app
```

**3. Click "Redeploy"**

- Takes 2-3 minutes
- CORS errors on frontend will be fixed

---

## 🔍 Common Issues & Fixes

### Backend not responding

**Problem**: `curl` fails or times out  
**Fix**:

1. Check Railway dashboard → Logs
2. Look for error messages
3. Check if built successfully
4. Try redeploying

### Database connection error

**Problem**: "Failed to connect to database"  
**Fix**:

1. Check `DATABASE_URL` and `DIRECT_URL` are set
2. Check PostgreSQL service is running in Railway
3. Check database hasn't run out of space

### CORS error from frontend

**Problem**: Frontend can't reach backend  
**Fix**:

1. Update `FRONTEND_URL` in Railway Variables
2. Make sure URL matches exactly (including protocol)
3. Click "Redeploy"
4. Wait 3 minutes and test again

### "Migrations failed" during deploy

**Problem**: Database schema update failed  
**Fix**:

1. Check logs for specific error
2. Verify Prisma schema is valid
3. Try redeploying
4. If persists, check database state in Railway

---

## 📝 Code Best Practices

### ✅ DO - Use Environment Variables

```javascript
const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;
const frontendUrl = process.env.FRONTEND_URL;
```

### ❌ DON'T - Hardcode Values

```javascript
// Wrong! Won't work on different servers
const port = 3000;
// Or use localhost in production
```

### ✅ DO - Centralize Database Access

```javascript
// Use from prisma/client.js
import prisma from "../prisma/client.js";
```

### ❌ DON'T - Create Multiple Connections

```javascript
// Wrong! Creates new connection each time
const prisma = new PrismaClient();
```

---

## 🚢 Deployment Checklist

Before pushing to production:

- [ ] Code works locally: `npm run dev`
- [ ] No console errors
- [ ] Database queries working
- [ ] Health endpoint responds
- [ ] Using environment variables (not hardcoded)
- [ ] `.env` NOT committed
- [ ] CORS properly configured
- [ ] No secrets in code

---

## 📊 Server Specs

| Property     | Value                 |
| ------------ | --------------------- |
| Runtime      | Node.js               |
| Framework    | Express.js            |
| Database     | PostgreSQL            |
| Region       | AWS (auto by Railway) |
| Auto-scaling | ✅ Enabled            |
| HTTPS        | ✅ Automatic          |

---

## 🔐 Security

**What's protected:**

- ✅ Environment variables in Railway (not GitHub)
- ✅ Database behind Railway network
- ✅ CORS validation enabled
- ✅ Input validation on all routes

**What to avoid:**

- ❌ Hard-coding database URLs
- ❌ Committing `.env` files
- ❌ Storing passwords in code
- ❌ Skipping input validation

---

## 📚 Useful Commands

```bash
# Local development
npm run dev                     # Start with nodemon (auto-restart)
npm start                       # Start production mode

# Database management
npm run db:migrate              # Run migrations
npm run db:generate             # Generate Prisma client

# Testing
curl http://localhost:3000/health

# Logs in production
# Check at: [railway.app](https://railway.app) → Logs tab
```

---

## 🎯 Summary

✅ **Backend is deployed** on Railway  
✅ **Auto-deploys** on GitHub push  
✅ **Database included** - PostgreSQL managed  
✅ **CORS configured** - communicates with frontend  
✅ **Production ready** - all security in place

**To update backend:**

1. Code locally & test
2. git push to main
3. Auto-deploys (wait 2-3 min)
4. Verify with health check
5. Done! 🚀

---

## 📞 Need Help?

Check this first, then see:

- `TEAM_DEPLOYMENT_SUMMARY.md` - Overall overview
- `frontend/DEPLOYMENT_SIMPLIFIED.md` - Frontend deployment

---

**Last Updated**: March 16, 2026  
**Status**: ✅ Production Ready
