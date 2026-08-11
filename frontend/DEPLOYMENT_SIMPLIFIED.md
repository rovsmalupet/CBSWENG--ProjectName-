# Frontend deployment — moved

The frontend still deploys to **Vercel**, but this file pointed at a Railway
backend URL. The backend now runs on **Render**.

### 👉 [DEPLOYMENT.md](../DEPLOYMENT.md)

The one thing worth repeating here: `VITE_API_URL` is baked in at **build**
time, so changing it in the Vercel dashboard does nothing until you **redeploy**.

Kept as a pointer so existing links do not lead anywhere misleading. Safe to
delete once everyone has updated their links.
