# BayaniHub

A donation and volunteering platform connecting donors with NGOs across ASEAN.

Originally built for CCAPDEV/CBSWENG; hardened for **CSSECDV** (Secure Web
Development). The security work is documented in
[SECURITY.md](SECURITY.md), and the original plan is in
[SECURITY_IMPLEMENTATION_PLAN.md](SECURITY_IMPLEMENTATION_PLAN.md).

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 7, React Router 7 |
| Backend | Node.js, Express 5 |
| Database | **PostgreSQL** via Prisma 5 |
| Auth | JWT (30-minute sessions, server-side revocation) |
| Payments | Stripe |

> Earlier revisions of this README said MongoDB. That was never accurate for
> this codebase — it uses PostgreSQL through Prisma.

---

## Prerequisites

- Node.js 20 or newer (developed on 22)
- A PostgreSQL database (Supabase, Railway, Neon, or local)

---

## Setup

### 1. Configure the backend

```bash
cd backend
cp .env.example .env
```

Fill in `.env`. Two variables are **required** and the server refuses to start
without them:

- `DATABASE_URL`
- `JWT_SECRET` — at least 32 characters of high-entropy random data:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

Refusing to boot on a missing or weak signing key is deliberate — see
[SECURITY.md](SECURITY.md) §2.1.2. A server that cannot verify tokens correctly
must not serve requests.

### 2. Install, migrate, seed

```bash
cd backend
npm install
npm run db:deploy   # applies migrations, including the CSSECDV security migration
npm run db:seed     # demo accounts and fixtures — prints the passwords ONCE
```

`npm run db:seed` prints the generated passwords to the console a single time.
They are stored nowhere in readable form. To choose your own, set
`SEED_ADMIN_PASSWORD`, `SEED_NGO_PASSWORD`, `SEED_DONOR_PASSWORD` (and the rest,
listed in `.env.example`) before seeding.

### 3. Configure the frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:3000
npm install
```

### 4. Run

Two terminals:

```bash
# Terminal 1
cd backend && npm run dev        # http://localhost:3000

# Terminal 2
cd frontend && npm run dev       # http://localhost:5173
```

For a demo or deployment, run the backend with `NODE_ENV=production` so error
responses are fully generic.

---

## Testing

```bash
cd backend && npm test
```

257 tests covering the password policy, the access-control policy table, the
security-question catalogue, business rules, input validation, and log
redaction. No database or network required — every suite exercises pure
decision logic, which is where a mistake becomes a vulnerability.

---

## Demo accounts

Created by `npm run db:seed`. Passwords are printed once when it runs.

| Rubric | Role | Email |
|---|---|---|
| 1.1.1 | Website Administrator | `admin@bayanihub.local` |
| 1.1.2 | Product Manager (NGO) | `mary.angela@redcross.ph` |
| 1.1.3 | Customer (Donor) | `donor@bayanihub.local` |

Plus fixtures that exist to make specific controls demonstrable — a second
administrator, a second NGO (for cross-tenant access attempts), a pending NGO,
an already-locked account, and an account whose password is too new to change.
See [SECURITY.md](SECURITY.md) §Demo.

Every seeded account answers the same two security questions:

- *street you lived on when you were ten* → `Mapagmahal Street`
- *first live concert you attended* → `Eraserheads at Cubao Expo`

---

## Project structure

```
backend/
  security/          the security core
    accessControl.js   THE single site-wide authorization component
    owners.js          object-level ownership resolvers
    passwordPolicy.js  complexity, length, hashing, history, minimum age
    securityQuestions.js
    securityLog.js     append-only audit log + redaction
    businessRules.js   state machines, server-side fee computation
    tokens.js          JWT issuing and verification
    env.js             boot-time configuration validation
  middleware/
    validate.js        one zod validator for every endpoint
    errorHandler.js    the one place an error becomes a response
    rateLimit.js
    uploadMiddleware.js
  schemas/           per-endpoint zod schemas
  controllers/       thin; no authorization, no error formatting
  routes/            pure route declarations
  tests/             npm test
  prisma/            schema, migrations, seed

frontend/src/
  context/           AuthContext — session state from the server
  components/        ProtectedRoute, PasswordField, ReauthModal,
                     LastAccessBanner, ErrorBoundary, SecurityQuestionsFields
  pages/             including ChangePassword, SecurityLogs, AdminUserManagement
  config/            api client and the client-side policy mirror
```

---

## Roles

| Role | Can do |
|---|---|
| **Administrator** | Create/disable administrator and NGO accounts, assign roles, approve NGO registrations, moderate projects, read the security log |
| **NGO** (Role A) | Create/edit/delete **own** projects, confirm or decline contributions to them, upload documentation |
| **Donor** (Role B) | Browse approved projects, contribute, manage **own** contributions and payment history |

All three can change their own password.
