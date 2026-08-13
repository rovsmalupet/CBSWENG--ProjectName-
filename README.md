# BayaniHub

A donation and volunteering platform connecting donors with NGOs across ASEAN.
Organizations post projects that need funding, volunteers, or in-kind goods;
donors browse and contribute; administrators moderate and keep the platform
trustworthy.

---

## Features

- **Organizations** register, get verified, and post projects with monetary,
  volunteer, and in-kind support goals. They confirm or decline incoming
  contributions and track funding progress in real time.
- **Donors** browse approved projects by country and cause, contribute money,
  volunteer hours, or goods, bookmark projects, and keep a history of their
  own contributions and payments.
- **Administrators** review and approve new organizations, moderate posted
  projects, manage accounts, and oversee platform activity.
- **Payments** are processed through Stripe, with transaction fees computed
  server-side from each project's own data.
- Project browsing is organized by ASEAN country and UN Sustainable
  Development Goal, with per-country statistics and cause-based filtering.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, React Router 7 |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL via Prisma 5 |
| Auth | JWT-based sessions |
| Payments | Stripe |

---

## Getting started

### Prerequisites

- Node.js 22 or newer
- A PostgreSQL database (a free tier from Supabase, Neon, or Render works fine,
  or run one locally)

### 1. Backend

```bash
cd backend
cp .env.example .env
```

Fill in `.env`. At minimum you need:

- `DATABASE_URL` and `DIRECT_URL` — your PostgreSQL connection strings
- `JWT_SECRET` — a random signing key, at least 32 characters:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
  ```

SMTP credentials are needed for the password-reset emails, and a Stripe secret
key is needed for payments — see the comments in `backend/.env.example` for the
full list.

```bash
npm install
npm run db:deploy   # applies database migrations
npm run db:seed     # optional: creates sample accounts and projects
npm run dev          # http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# set VITE_API_URL to your backend URL (defaults to http://localhost:3000)
npm install
npm run dev           # http://localhost:5173
```

---

## Testing

```bash
cd backend
npm test
```

Runs the backend's automated test suite. No live database or network
connection is required.

---

## Project structure

```
backend/
  controllers/    request handlers
  routes/         API route definitions
  services/       business logic
  security/       authentication, authorization, and validation
  middleware/     request validation, error handling, rate limiting
  schemas/        request validation schemas
  prisma/         database schema, migrations, and seed data
  tests/          automated test suite

frontend/src/
  pages/          route-level views
  components/     shared UI components
  context/        app-wide state (e.g. the current session)
  css/            stylesheets
  config/         API client configuration
```

---

## Deployment

The frontend deploys to Vercel and the backend to a Node host such as Render,
with a PostgreSQL database (e.g. Supabase). Configure the environment variables
described above on whichever platforms you use, and point the frontend's
`VITE_API_URL` at your deployed backend.
