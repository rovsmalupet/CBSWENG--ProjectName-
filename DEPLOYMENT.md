# Deployment

The single deployment reference for this project. It replaces the four
overlapping Railway-era guides (`TEAM_DEPLOYMENT_SUMMARY.md`,
`DEPLOYMENT_GUIDES.md`, `backend/DEPLOYMENT_SIMPLIFIED.md`,
`frontend/DEPLOYMENT_SIMPLIFIED.md`), which now point here.

---

## Architecture

| Component | Platform | Notes |
|---|---|---|
| Backend API | **Render** (free web service) | Blueprint in [render.yaml](render.yaml) |
| Frontend | **Vercel** | React 19 + Vite |
| Database | **Supabase** PostgreSQL | Not managed by Render |

Railway was dropped when its free plan ended. Everything below assumes Render.

---

## Environment variables

### Backend — Render dashboard → Service → Environment

The server **refuses to start** without the first two. That is deliberate: a
server that cannot verify tokens correctly must not serve requests
([SECURITY.md](SECURITY.md) §2.1.2). If a deploy fails instantly, read the log —
it names the missing variable.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | **yes** | Supabase pooled connection string |
| `JWT_SECRET` | **yes** | ≥32 chars of random data. Boot aborts if short or a known placeholder |
| `DIRECT_URL` | yes | Supabase direct connection, used for migrations |
| `NODE_ENV` | yes | `production` — makes error responses fully generic |
| `FRONTEND_URL` | yes in prod | Exact Vercel origin, **no trailing slash**. Boot aborts without it in production |
| `STRIPE_SECRET_KEY` | for payments | The **secret** key. Not `VITE_STRIPE_PUBLISHABLE_KEY` — that is a frontend build value the backend never reads. Missing it means payments and refunds return `503` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `EMAIL_FROM` | for password reset | Without these the forgot-password email silently fails to send |
| `RESET_PASSWORD_URL` | for password reset | `https://<your-vercel-app>/reset-password` — the link users receive |
| `SEED_ADMIN_PASSWORD` | optional | See [Seeding](#seeding) |
| `PORT` | no | Render sets it; `server.js` already reads `process.env.PORT` |

Generate a signing key:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

`FRONTEND_URL` accepts a comma-separated list, which is how you allow more than
one origin:

```
FRONTEND_URL=https://your-app.vercel.app,https://your-app-git-main-you.vercel.app
```

### Frontend — Vercel dashboard → Settings → Environment Variables

```
VITE_API_URL=https://<your-render-service>.onrender.com
VITE_ENV=production
```

`VITE_*` values are baked in at **build** time. Changing one requires a
**redeploy** on Vercel — editing the variable alone changes nothing.

Locally, `frontend/.env` should point at `http://localhost:3000`.

---

## Deploying

Both platforms auto-deploy on push to `main`.

```bash
# test locally first
cd backend && npm run dev
cd frontend && npm run dev

git add .
git commit -m "..."
git push origin main
```

Render runs `npm install` (whose `postinstall` runs `prisma generate`), then
`npm start`, which is `prisma migrate deploy && node server.js`. **Migrations
apply automatically on every deploy** — including the CSSECDV security
migration.

Verify:

```bash
curl https://<your-render-service>.onrender.com/health
# {"status":"OK"}
```

The response is deliberately minimal. It used to report the environment too;
that is free reconnaissance for an attacker, so it was removed.

---

## Seeding

Render's free tier has **no shell**, so you cannot run `npm run db:seed` there.
Migrations give you the schema; they do not give you accounts. Two options:

### Option 1 — seed from your machine (recommended before a demo)

Temporarily point your local `backend/.env` at the production database, seed,
then put your local URL back:

```bash
cd backend
# set DATABASE_URL + DIRECT_URL to the Supabase production values
npm run db:seed        # prints every password ONCE — copy them
# restore your local values
```

This is the only route that creates the demo fixtures — the second NGO for
cross-tenant access tests, the pre-locked account, the pending organization, and
the account whose password is too new to change. You need those for the
security demo.

To choose the passwords instead of having them generated, set the `SEED_*`
variables in `backend/.env` first — the full list is in
[backend/.env.example](backend/.env.example).

> `npm run db:seed` **wipes and rebuilds** all accounts. Never point it at a
> database whose data you want to keep.

### Option 2 — bootstrap administrator only

On first boot with no administrator present, the server creates
`admin@bayanihub.local` and prints a generated password **once** into the Render
log. Set `SEED_ADMIN_PASSWORD` to choose it yourself and avoid log-scraping.

That gets you in, but creates no other accounts or projects.

---

## Render free tier: two things that will bite you

**Services sleep after ~15 minutes idle.** The next request takes 30–60 seconds
while the container wakes. To a grader loading your URL cold, the app looks
broken. **Open the site a few minutes before you present.**

**The generated hostname may not be what you expect.** Render gives you
`https://<service-name>.onrender.com` only if that name is free globally;
otherwise it appends a suffix. Check the real URL in the dashboard and make sure
`VITE_API_URL` on Vercel matches it exactly.

---

## Troubleshooting

### Deploy fails immediately, log says a variable is missing

Working as intended — see [Environment variables](#environment-variables). Add
it and redeploy.

### CORS errors in the browser console

The backend allows only the origins in `FRONTEND_URL`. Check it matches the
Vercel origin **exactly**: right protocol, no trailing slash, no typo. Update it
in Render and redeploy the backend.

Note that Vercel **preview** deployments get their own unique URLs, which will
not be in the allowlist. Either test against the production URL or add the
preview origin to the comma-separated list.

### Everything returns 401 after a while

Sessions last 30 minutes, and are invalidated server-side by a password change,
a role change, or signing out. Sign in again. This is the token-revocation
behaviour described in [SECURITY.md](SECURITY.md).

### Payments/refunds return 503 "Payments are unavailable right now"

`STRIPE_SECRET_KEY` is not set on Render, or the publishable key was set by
mistake. The backend needs the secret key; Vercel needs the publishable one.

### Password reset emails never arrive

Check the `SMTP_*` variables and `EMAIL_FROM`. The endpoint deliberately returns
the same success message whether or not the address exists — that prevents
account enumeration — so a silent failure looks identical to success from the
browser. The Render log will show the send error.

### Rate limited / everyone locked out at once

If `trust proxy` were misconfigured, the rate limiter would see Render's proxy
address for every request and throttle all users together. `server.js` sets
`trust proxy` to 1 in production, which is correct for Render. Do not change it
without reason.

### "Migrations failed" during deploy

Read the Render log for the specific Prisma error. Most often the database is
unreachable — if Supabase has paused the project (free tier pauses after about a
week of inactivity), restore it from the Supabase dashboard first.

---

## Security notes for deployment

- **Never commit `.env`.** It is gitignored. All secrets belong in the Render and
  Vercel dashboards.
- `render.yaml` marks every secret `sync: false`, so Render prompts for the
  values rather than storing them in the repository.
- Run with `NODE_ENV=production` so error responses carry no internal detail.
- The `backend/.env` in this repository's **git history** contains a live
  `JWT_SECRET` and SMTP password from before the security work. Those must be
  rotated and the file purged from history — see
  [SECURITY.md](SECURITY.md) § "Still required from the team".

---

## API surface

Rather than duplicating an endpoint list that goes stale, the authoritative
source is the access-control policy table in
[backend/security/accessControl.js](backend/security/accessControl.js). It lists
every route with its required role, ownership rule, and whether it needs
re-authentication — and the server refuses to serve any route missing from it.

On boot the log confirms coverage:

```
✓ Access control: 55 routes registered, all covered by a policy.
```

Only these are reachable without signing in:

```
GET  /health                     POST /login
GET  /posts/approved             POST /register
GET  /auth/security-questions    POST /organizations/register
GET  /verify-reset-token         POST /forgot-password
                                 POST /reset-password
                                 POST /reset-password/verify-answers
```
