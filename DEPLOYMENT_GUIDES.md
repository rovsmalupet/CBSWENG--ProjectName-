# 📚 Deployment Guides - Quick Navigation

## 🎯 Choose Your Guide

### I want a quick overview

👉 **Read**: [TEAM_DEPLOYMENT_SUMMARY.md](./TEAM_DEPLOYMENT_SUMMARY.md)  
📋 Contains: Live URLs, variables, endpoints, troubleshooting

---

### I need to work on the backend

👉 **Read**: [backend/DEPLOYMENT_SIMPLIFIED.md](./backend/DEPLOYMENT_SIMPLIFIED.md)  
📋 Contains: How to deploy changes, database info, env variables

---

### I need to work on the frontend

👉 **Read**: [frontend/DEPLOYMENT_SIMPLIFIED.md](./frontend/DEPLOYMENT_SIMPLIFIED.md)  
📋 Contains: How to deploy changes, API endpoints, troubleshooting

---

### I need detailed technical info

👉 **Read**:

- [backend/DEPLOYMENT.md](./backend/DEPLOYMENT.md)
- [frontend/DEPLOYMENT.md](./frontend/DEPLOYMENT.md)

---

## ⚡ 30-Second Summary

### Live Deployment

- **Backend**: https://cbsweng-projectname-production.up.railway.app
- **Frontend**: https://cbsweng-project-name-ddtf.vercel.app

### Make Changes & Deploy

```bash
# Edit code
cd backend  # or cd frontend
# ... make changes ...
git add .
git commit -m "Your message"
git push origin main
# Wait 2-3 minutes... Done! Auto-deployed ✅
```

### What You Need to Know

- Backend is on **Railway** (Node.js + PostgreSQL)
- Frontend is on **Vercel** (React + Vite)
- Both auto-deploy on push to `main` branch
- All config in `.env` files (never commit these!)
- Environment variables set in Railway & Vercel dashboards

---

## 🔑 Key Credentials & URLs

| Item              | Value                                                        |
| ----------------- | ------------------------------------------------------------ |
| GitHub Repo       | rovsmalupet/CBSWENG--ProjectName-                            |
| Backend URL       | https://cbsweng-projectname-production.up.railway.app        |
| Frontend URL      | https://cbsweng-project-name-ddtf.vercel.app                 |
| Health Check      | https://cbsweng-projectname-production.up.railway.app/health |
| Railway Dashboard | [railway.app](https://railway.app)                           |
| Vercel Dashboard  | [vercel.com](https://vercel.com)                             |

---

## 📖 Document Guide

| Document                          | Purpose                                   | Audience            |
| --------------------------------- | ----------------------------------------- | ------------------- |
| TEAM_DEPLOYMENT_SUMMARY.md        | Overall deployment info & troubleshooting | Everyone            |
| backend/DEPLOYMENT_SIMPLIFIED.md  | Quick backend deployment guide            | Backend devs        |
| frontend/DEPLOYMENT_SIMPLIFIED.md | Quick frontend deployment guide           | Frontend devs       |
| backend/DEPLOYMENT.md             | Detailed backend setup                    | Technical reference |
| frontend/DEPLOYMENT.md            | Detailed frontend setup                   | Technical reference |

---

## ✅ Checklist Before Using Deployment

- [ ] You have GitHub access to the repo
- [ ] You have [railway.app](https://railway.app) account
- [ ] You have [vercel.com](https://vercel.com) account
- [ ] You can see the live apps working
- [ ] You've tested locally first

---

## 🆘 Troubleshooting

### I see a blank page

1. Open console (F12)
2. Check for error messages
3. Check Network tab for failed requests
4. See "CORS error" section below

### I get CORS errors

1. Go to [railway.app](https://railway.app)
2. Update `FRONTEND_URL` to your current Vercel URL
3. Click "Redeploy" backend
4. Wait 3 minutes
5. Reload frontend

### Build failed on Vercel

1. Check logs: [vercel.com](https://vercel.com) → Deployments
2. Look for specific error
3. Fix locally
4. Push again

### Backend not responding

1. Check: curl https://cbsweng-projectname-production.up.railway.app/health
2. Check logs: [railway.app](https://railway.app) → Logs
3. Look for error message
4. Redeploy if needed

---

## 🚀 Quick Start

**First time deploying?**

1. Read: [TEAM_DEPLOYMENT_SUMMARY.md](./TEAM_DEPLOYMENT_SUMMARY.md)
2. Make a small change locally
3. Test: `npm run dev` in terminal
4. Push: `git push origin main`
5. Check deployment: [vercel.com](https://vercel.com) or [railway.app](https://railway.app)
6. Done! ✅

---

## 📚 All Available Guides

```
DEPLOYMENT_GUIDES.md (← You are here)
TEAM_DEPLOYMENT_SUMMARY.md
DEPLOYMENT_GUIDE.md (full stack overview)

backend/
├── DEPLOYMENT.md (detailed)
├── DEPLOYMENT_SIMPLIFIED.md (quick)
├── .env.example
└── ...

frontend/
├── DEPLOYMENT.md (detailed)
├── DEPLOYMENT_SIMPLIFIED.md (quick)
├── .env.example
├── .env.production
└── ...
```

---

## 💡 Pro Tips

1. **Always test locally first** - `npm run dev` before pushing
2. **Keep `.env` files safe** - Never commit them to GitHub
3. **Check the logs** - Both Railway and Vercel have detailed logs
4. **Update FRONTEND_URL** - When Vercel URL changes
5. **Use API config** - Don't hardcode URLs in React

---

## 📞 Questions?

1. Check the appropriate guide above
2. Search for error message in guide
3. Check troubleshooting sections
4. Ask team members

---

## ✨ Summary

You have:

- ✅ Backend running on Railway
- ✅ Frontend running on Vercel
- ✅ Auto-deployment on push
- ✅ Database connected
- ✅ All security configured

**Everything is ready to go!** 🎉

Start with one of the guides above. Good luck! 🚀
