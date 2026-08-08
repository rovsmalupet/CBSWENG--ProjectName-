# CSSECDV Machine Project — Security Implementation Plan

**Project:** BayaniHub (CBSWENG carry-over)
**Stack:** React 19 + Vite (frontend) · Express 5 + Prisma 5 + PostgreSQL (backend) · JWT auth · Stripe
**Target:** 58/58 on the CSSECDV checklist in `Machine_Project_-_Web_App.md`
**Status:** Planning only — no code has been changed.

---

## 0. How to read this document

- **§1** maps the three required roles onto what already exists.
- **§2** is the honest audit: what the codebase does today per checklist item, and the real defects found while reading it.
- **§3** is the architecture we need to add before individual controls can be built cleanly.
- **§4–§11** are the implementation phases, in dependency order, with file-level detail.
- **§12** is the pre-demo account/data setup (rubric 1.1).
- **§13** is the demo script — one row per rubric line, what to click, what the grader should see.
- **§14** covers testing, risk, and effort.

Checklist item numbers (e.g. `2.1.8`) refer to the rubric in `Machine_Project_-_Web_App.md`.

---

## 1. Role mapping

The rubric asks for three roles. We already have three user models, so no invention is needed — just a rename in how we *talk* about them.

| Rubric role | Rubric example | Our role | Prisma model | JWT `role` |
|---|---|---|---|---|
| Administrator | Website Administrator | Admin | `Admin` | `admin` |
| Role A | Product Manager | NGO / Organization | `Organization` | `ngo` |
| Role B | Customer | Donor | `Donor` | `donor` |

**Permissions unique to each role** (the rubric requires each of A and B to have something the other cannot do):

| Capability | admin | ngo (Role A) | donor (Role B) |
|---|:--:|:--:|:--:|
| Create/delete admin and NGO accounts, assign roles | ✅ | ❌ | ❌ |
| Read the security/audit log | ✅ | ❌ | ❌ |
| Approve/reject NGO registrations | ✅ | ❌ | ❌ |
| Approve/unapprove project posts | ✅ | ❌ | ❌ |
| Create/edit/delete **own** project posts | ❌ | ✅ | ❌ |
| Confirm/decline contributions to **own** posts | ❌ | ✅ | ❌ |
| Upload project documentation to **own** posts | ❌ | ✅ | ❌ |
| Self-register via public page | ❌ | ✅ (pending approval) | ✅ (immediate) |
| Create/view/edit/withdraw **own** contributions | ❌ | ❌ | ✅ |
| View **own** payment history | ❌ | ✅ (own org) | ✅ (own) |
| Change own password | ✅ | ✅ | ✅ |

This satisfies "there must still be permissions unique for each role, particularly for Roles A and B."

---

## 2. Current-state audit

### 2.1 What is already good

These are worth *saying out loud* during the demo — do not rewrite them.

- Passwords are hashed with **bcrypt** (`SALT_ROUNDS = 10`) in `backend/services/userAccountService.js`, never stored plaintext, never returned by the API (`sanitizeUser` strips them).
- Login failure already returns a **single generic message** — `"Invalid credentials."` — for both unknown-email and wrong-password (2.1.4 is essentially already met).
- Forgot-password already refuses to confirm whether an email exists.
- Password reset tokens are **random 32 bytes, SHA-256-hashed at rest, single-use, 24h expiry** — a solid design already.
- Password inputs already use `type="password"` on the login page (2.1.7 partially met).
- All DB access goes through **Prisma's query builder** — no raw SQL anywhere in the repo (verified by grep). SQL injection is structurally prevented.
- No `dangerouslySetInnerHTML` / `innerHTML` anywhere — React's default escaping handles reflected XSS.
- Uploads already have a MIME allowlist and a size cap.
- A `PostAuditLog` table already exists for admin post-status changes — the seed of a real audit trail.

### 2.2 Checklist gap analysis

| # | Requirement | Today | Gap |
|---|---|---|---|
| 2.1.1 | Auth on all non-public pages | Partial | Per-route middleware, easy to forget; frontend `RequireRole` trusts `localStorage` (spoofable); no default-deny |
| 2.1.2 | Auth fails securely | Partial | No startup check that `JWT_SECRET` exists; controllers leak `err.message` on failure |
| 2.1.3 | Salted one-way hashes | ✅ | Bump cost to 12; unify the three password columns |
| 2.1.4 | Generic auth failure | ✅ | Keep; add constant-time dummy compare; make the "NGO pending approval" 403 generic too |
| 2.1.5 | Password complexity | ❌ | Only `length >= 6`. No character-class or common-password rules |
| 2.1.6 | Password length policy | ❌ | 6 is far below policy; no maximum (bcrypt silently truncates >72 bytes) |
| 2.1.7 | Obscured entry | Partial | Confirm on all 4 password forms, add show/hide toggle defaulting to hidden |
| 2.1.8 | Lockout after N failures | ❌ | Nothing. Unlimited login attempts |
| 2.1.9 | Reset questions w/ random answers | ❌ | Reset is email-token only; no security questions at all |
| 2.1.10 | Prevent password re-use | ❌ | No password history |
| 2.1.11 | Min password age 1 day | ❌ | No `passwordChangedAt` |
| 2.1.12 | Report last use at next login | ❌ | No `lastLoginAt` / `lastFailedLoginAt` |
| 2.1.13 | Re-auth before critical ops | ❌ | No change-password endpoint at all; no re-auth anywhere |
| 2.2.1 | Single site-wide authz component | ❌ | `authenticate` + `authorizeRoles` repeated on ~25 routes across 5 files |
| 2.2.2 | Access control fails securely | ❌ | **Multiple live IDOR holes** — see §2.3 |
| 2.2.3 | Business-rule enforcement | ❌ | Client controls payment amounts; no post state machine; totals increment on unconfirmed contributions |
| 2.3.1 | Reject, never sanitize | ❌ | Code actively *coerces* bad input (silent defaults, `parseFloat`, silent drop of invalid items) |
| 2.3.2 | Validate range | ❌ | No numeric/date bounds anywhere |
| 2.3.3 | Validate length | ❌ | No max lengths; 50 MB upload cap |
| 2.4.1 | No stack traces to client | ❌ | `res.json({ error: err.message })` in ~15 places; `code`/`meta`/`stack` leaked in `createPost` |
| 2.4.2 | Generic errors + custom pages | ❌ | Raw `API Error: 500 Internal Server Error` shown to users; no 404 route → blank page |
| 2.4.3 | Log success **and** failure | ❌ | Only `PostAuditLog` (admin post-status). No auth/authz/validation logging |
| 2.4.4 | Logs restricted to admin | ❌ | No log surface exists to restrict |
| 2.4.5 | Log validation failures | ❌ | None |
| 2.4.6 | Log auth attempts | ❌ | None |
| 2.4.7 | Log access-control failures | ❌ | None |

### 2.3 Concrete defects found (fix these — they are the demo's best evidence)

**CRITICAL — secrets committed to git**

`backend/.env` is **tracked in version control** (confirmed via `git ls-files`). It contains a live `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, and `SMTP_PASS`. The file even carries a comment saying it should never be committed. Anyone with repo access has full database and mail-account control, and can forge JWTs for any role including `admin`.

**CRITICAL — broken object-level authorization (IDOR)**

| Endpoint | File | Problem |
|---|---|---|
| `PUT /posts/:postId` | `backend/controllers/postController.js:376` | Role-gated to `ngo`, but **never checks `post.orgId === req.user.id`**. Any NGO can rewrite any other NGO's project |
| `DELETE /posts/:postId` | `postController.js:416` | Same — any NGO can delete any org's post |
| `GET /posts/:postId` | `postController.js:356` | Any authenticated user reads any post, including `Pending`, `Unapproved`, and `Deleted` ones |
| `POST /refunds/issue` | `refundController.js:24` | Any NGO can refund **any** payment on **any** org's post. Financial impact |
| `GET /payments/:paymentId` | `paymentController.js:233` | Any authenticated user reads any payment record |
| `GET /payments/history/:postId` | `paymentController.js:187` | Any NGO sees any post's payment history |
| `GET /refunds/:refundId`, `GET /refunds/history/:postId` | `refundController.js` | No ownership check |
| `GET /documents/:postId`, `GET /documents/download/:documentId` | `documentController.js:79,108` | Any authenticated user downloads any org's uploaded documents |

Note the contrast: `uploadDocument` and `deleteDocument` **do** check ownership (`documentController.js:32,152`), and `getPaymentsByDonor`/`getPaymentsByProject` **do** too. The checks exist but were applied ad hoc — exactly the problem 2.2.1 ("single site-wide component") is designed to solve. This is the strongest possible argument for the refactor.

**HIGH — client controls money**

`POST /payments/intent` (`paymentController.js:25`) takes `donationAmount`, `monetaryFee`, `volunteerFee`, `inKindFee` **straight from the request body** and charges their sum. A donor can send `donationAmount: 100000, monetaryFee: 1` and pay a ₱1 transaction fee on a ₱100,000 donation. Fees must be computed server-side.

`POST /payments/confirm` (`paymentController.js:110`) trusts the client's `postId` instead of the `postId` in the Stripe PaymentIntent metadata, and never verifies `metadata.userId === req.user.id` — so one user can confirm and claim another user's payment intent.

**MEDIUM — business logic**

- `addContribution` (`postController.js:507`) increments `currentAmount`/`currentCount` **immediately**, even when `status = "Pending"` and the org hasn't confirmed. Fundraising totals are inflatable by anyone. It also never checks the post is `Approved`, or that support options are `Open`.
- `updatePostStatus` allows any status → any status; a `Deleted` post can be resurrected to `Approved`.
- `resetPassword` (`userAccountService.js:478`) runs `updateMany` across **all three tables** for the email. If the same email ever exists in two tables, one reset changes both accounts.

**MEDIUM — runtime bugs that will surface as 500s during the demo**

- `backend/controllers/refundController.js:15` calls `require("stripe")` inside an **ESM** module (`"type": "module"` in `package.json`). `require` is not defined → every refund attempt throws `ReferenceError`.
- `refundController.js:117` and `:154` select `payment.amount`, but the `amount` column was removed from `Payment` by migration `20260402_remove_payment_amount`. Prisma will throw a validation error → 500.

**LOW–MEDIUM**

- Weak seeded credentials hardcoded in source: `admin123`, `donor123`, `redcross123`, etc. (`userAccountService.js:43`, `prisma/seed.js`).
- JWT lifetime is **7 days** with no revocation. Logout only clears `localStorage`; a stolen token stays valid for a week, and changing your password does not invalidate it.
- JWT stored in `localStorage` → readable by any XSS.
- `express.json()` with no explicit body-size limit; 50 MB upload cap.
- `README.md` still says MongoDB — the project uses PostgreSQL. Confusing for a grader.

---

## 3. Foundational architecture

Three new pieces make the rest of the plan cheap instead of triplicated.

### 3.1 Unified `UserAccount` table (unblocks 2.1.3, 2.1.5–2.1.13)

Right now `Admin`, `Donor`, and `Organization` each carry their own `password` column. Every authentication control — lockout counters, password history, password age, last-login reporting, security questions — would otherwise have to be implemented **three times** and kept in sync.

**Design: additive, non-breaking.** Add one `UserAccount` table that owns *authentication*. Keep `Admin` / `Donor` / `Organization` as *profile* tables, linked 1:1.

```prisma
model UserAccount {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String
  role          UserRole                        // admin | ngo | donor
  status        AccountState @default(Active)   // Active | Pending | Disabled | Rejected

  // 2.1.8 — lockout
  failedLoginAttempts Int       @default(0)
  lockedUntil         DateTime?

  // 2.1.11 — minimum password age
  passwordChangedAt   DateTime  @default(now())
  mustChangePassword  Boolean   @default(false) // admin-provisioned accounts bypass min-age once

  // 2.1.12 — last-use reporting
  lastLoginAt              DateTime?
  lastLoginIp              String?
  lastFailedLoginAt        DateTime?
  lastFailedLoginIp        String?
  failedAttemptsSinceLogin Int      @default(0)

  // 2.1.13 — token revocation on password change / logout
  tokenVersion  Int      @default(0)

  createdAt     DateTime @default(now())

  // 1:1 links to the existing profile rows
  admin         Admin?
  donor         Donor?
  organization  Organization?

  passwordHistory   PasswordHistory[]
  securityAnswers   SecurityAnswer[]
  securityLogs      SecurityLog[]
}

// 2.1.10 — password re-use prevention
model PasswordHistory {
  id           String   @id @default(uuid())
  accountId    String
  account      UserAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  passwordHash String
  createdAt    DateTime @default(now())
  @@index([accountId, createdAt])
}

// 2.1.9 — password reset questions
model SecurityAnswer {
  id           String   @id @default(uuid())
  accountId    String
  account      UserAccount @relation(fields: [accountId], references: [id], onDelete: Cascade)
  questionKey  String              // FK-by-key into a server-side question catalogue
  answerHash   String              // bcrypt of normalized answer — never plaintext
  createdAt    DateTime @default(now())
  @@unique([accountId, questionKey])
}

enum UserRole   { admin ngo donor }
enum AccountState { Active Pending Disabled Rejected }
```

Each profile model gains `accountId String @unique` + relation. `password` columns on the three profile tables get **dropped** after backfill.

**The critical compatibility rule:** `req.user.id` must keep meaning *profile id* (`Organization.id` / `Donor.id` / `Admin.id`), because it is used directly as `orgId`, `donorId`, and `Payment.userId` throughout the app. The JWT payload becomes:

```js
{ sub: account.id, pid: profile.id, role, tv: account.tokenVersion }
// middleware sets: req.user = { accountId, id: pid, role, tokenVersion }
```

Downstream controllers keep working unchanged. This is what makes the migration safe.

**Migration steps** (`prisma/migrations/` + a one-off script):
1. Create `UserAccount`, `PasswordHistory`, `SecurityAnswer`, `SecurityLog`; add nullable `accountId` to the three profile tables.
2. Backfill script: for each row in `Admin`/`Donor`/`Organization`, create a `UserAccount` copying `email` + `password` → `passwordHash`, set `role`, map `status` (`Organization.status`/`Donor.status` → `AccountState`), set `passwordChangedAt = createdAt`, link `accountId`. Seed one `PasswordHistory` row per account.
3. Make `accountId` required + unique; drop `password` from the profile tables.
4. Handle the duplicate-email edge case discovered in step 2 by failing loudly — do not merge silently.

*Fallback if time runs short:* add every auth column to all three tables and hide the branching behind a `userRepository.js`. Cheaper migration, ~3× the code and a permanent drift risk. Prefer `UserAccount`.

### 3.2 Single site-wide access-control component (2.2.1, 2.2.2, 2.4.7)

New: `backend/security/accessControl.js`, mounted **once** in `server.js` before any router. Per-route `authenticate, authorizeRoles(...)` calls are deleted from all five route files.

```js
// Declarative policy table — the single source of truth for who may touch what.
const POLICIES = [
  { method: "POST", path: "/login",                 public: true },
  { method: "POST", path: "/register",              public: true },
  { method: "POST", path: "/organizations/register",public: true },
  { method: "POST", path: "/forgot-password",       public: true },
  { method: "GET",  path: "/posts/approved",        public: true },
  { method: "GET",  path: "/health",                public: true },

  { method: "PUT",  path: "/posts/:postId", roles: ["ngo"],  owner: owners.post },
  { method: "POST", path: "/refunds/issue", roles: ["ngo","admin"], owner: owners.paymentPost,
    reauth: true },
  { method: "GET",  path: "/security-logs", roles: ["admin"] },
  // ... one row per endpoint
];
```

The middleware, in order:
1. Match `(method, path)` against the table. **No match → 403 + `ACCESS_DENIED_NO_POLICY` log.** Default deny; adding a route without a policy fails closed instead of open.
2. `public: true` → pass through.
3. Verify JWT (signature, expiry, `tv` vs current `tokenVersion`). Failure → 401 + `AUTH_TOKEN_INVALID` log.
4. Load the account; reject if `status !== Active` or `lockedUntil > now`.
5. `roles` check. Failure → 403 + `ACCESS_DENIED_ROLE` log.
6. `owner` resolver (e.g. `owners.post` loads the post and asserts `post.orgId === req.user.id`, with `admin` bypassing). Resolver throws or returns false → 403 + `ACCESS_DENIED_OWNERSHIP` log. **Any exception inside the resolver is caught and converted to deny**, never to allow.
7. `reauth: true` → require a valid, unexpired re-auth token (§5.7).

Ownership resolvers live in `backend/security/owners.js` — one small function per resource type (`post`, `document`, `payment`, `refund`, `contribution`, `organization`, `donor`). They are declared in the policy table, so authorization is still *decided in one place*; only the lookup is factored out.

**Frontend counterpart:** replace the `localStorage`-trusting `RequireRole` in `frontend/src/App.jsx:32` with an `AuthContext` that calls `GET /auth/me` once on mount and derives role from the **server's** answer, plus a single `<ProtectedRoute roles={[...]}>` wrapper used by every non-public route. This is UX only — the backend stays authoritative — but it means a user who edits `localStorage.userRole = "admin"` sees the login page, not a broken admin dashboard.

### 3.3 Security logging service (2.4.3–2.4.7)

```prisma
model SecurityLog {
  id           String   @id @default(uuid())
  createdAt    DateTime @default(now())

  eventType    String              // LOGIN_SUCCESS, ACCESS_DENIED_ROLE, ...
  outcome      LogOutcome          // SUCCESS | FAILURE
  severity     LogSeverity         // INFO | WARN | CRITICAL

  actorAccountId String?
  actor          UserAccount? @relation(fields: [actorAccountId], references: [id], onDelete: SetNull)
  actorEmail     String?           // for failed logins where no account resolves
  actorRole      String?

  ipAddress    String?
  userAgent    String?
  httpMethod   String?
  route        String?

  targetType   String?             // "Post", "Payment", "UserAccount", ...
  targetId     String?

  message      String
  metadata     Json?               // redacted; never secrets

  @@index([createdAt])
  @@index([eventType, outcome])
  @@index([actorAccountId])
  @@index([ipAddress])
}

enum LogOutcome  { SUCCESS FAILURE }
enum LogSeverity { INFO WARN CRITICAL }
```

`backend/security/securityLog.js` exports `logSecurityEvent(req, { eventType, outcome, ... })`. Rules baked into the service:

- **Never** log passwords, password hashes, reset tokens, security answers, JWTs, or Stripe secrets. A `redact()` helper strips a denylist of keys from `metadata` before write.
- Log writes must never break the request — wrap in try/catch, fall back to `console.error`.
- Every log write is **append-only**. There is no update or delete path, in the service or in the API.

**Event catalogue** (this is the list to show the grader for 2.4.3 — note that every family has both a success and a failure member):

| Family | Events |
|---|---|
| Authentication | `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `LOGOUT`, `ACCOUNT_LOCKED`, `ACCOUNT_UNLOCKED`, `REGISTRATION_SUCCESS`, `REGISTRATION_FAILURE` |
| Password | `PASSWORD_CHANGE_SUCCESS`, `PASSWORD_CHANGE_FAILURE`, `PASSWORD_RESET_REQUESTED`, `PASSWORD_RESET_SUCCESS`, `PASSWORD_RESET_FAILURE`, `PASSWORD_REUSE_REJECTED`, `PASSWORD_MIN_AGE_REJECTED`, `SECURITY_ANSWER_SUCCESS`, `SECURITY_ANSWER_FAILURE` |
| Re-authentication | `REAUTH_SUCCESS`, `REAUTH_FAILURE` |
| Authorization | `ACCESS_GRANTED_SENSITIVE`, `ACCESS_DENIED_NO_POLICY`, `ACCESS_DENIED_UNAUTHENTICATED`, `ACCESS_DENIED_ROLE`, `ACCESS_DENIED_OWNERSHIP`, `AUTH_TOKEN_INVALID` |
| Validation | `INPUT_VALIDATION_FAILURE` |
| Admin actions | `USER_CREATED`, `USER_DELETED`, `USER_ROLE_CHANGED`, `ACCOUNT_APPROVED`, `ACCOUNT_REJECTED`, `POST_STATUS_CHANGED`, `SECURITY_LOG_VIEWED` |
| Business/financial | `PAYMENT_INTENT_CREATED`, `PAYMENT_CONFIRMED`, `PAYMENT_CONFIRM_REJECTED`, `REFUND_ISSUED`, `REFUND_REJECTED`, `CONTRIBUTION_CREATED`, `CONTRIBUTION_CONFIRMED`, `CONTRIBUTION_DECLINED` |
| Errors | `UNHANDLED_ERROR` |

---

## 4. Phase 0 — Secrets and repo hygiene (do this first, ~1 hour)

Nothing else matters if the JWT signing key is public.

1. **Rotate every secret** currently in `backend/.env`: database password, `JWT_SECRET` (generate with `openssl rand -base64 48` / `node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"`), SMTP app password, and the Stripe key if it is a live key.
2. `git rm --cached backend/.env` and commit. Confirm `.env` is matched by `.gitignore` (it is — root `.gitignore:2`).
3. Purge the file from history with `git filter-repo --path backend/.env --invert-paths` (or BFG), then force-push and have every teammate re-clone. Document in the report that this was done and why.
4. Update `backend/.env.example` to list every key actually used, with placeholders: `JWT_SECRET`, `SMTP_*`, `EMAIL_FROM`, `RESET_PASSWORD_URL`, `STRIPE_SECRET_KEY`, plus the new `SEED_ADMIN_PASSWORD` etc.
5. Add a startup guard in `server.js`: if `JWT_SECRET` is missing, shorter than 32 chars, or equal to a known placeholder → `console.error` + `process.exit(1)`. **Fail securely at boot rather than silently signing tokens with `undefined`** (2.1.2).
6. Fix `README.md` — it claims MongoDB; the project is PostgreSQL + Prisma.

---

## 5. Phase 1 — Authentication (§2.1, 26 of 58 points)

### 5.1 Password policy module — 2.1.5, 2.1.6

New: `backend/security/passwordPolicy.js`, the single authority used by registration, admin user creation, self-service change, and reset.

```
Length:      minimum 12, maximum 64 characters
             (64 because bcrypt silently truncates past 72 BYTES — we reject
             rather than let a user believe a 100-char password is fully used)
Complexity:  must contain all four of
               - lowercase  [a-z]
               - uppercase  [A-Z]
               - digit      [0-9]
               - special    [^A-Za-z0-9]
Denylist:    reject a top-1000 common-password list (bundled as a local JSON —
             no network call), case-insensitive
Contextual:  reject if the password contains the local-part of the user's email,
             their first name, last name, or org name (min 4 chars, case-insensitive)
Whitespace:  allowed inside; leading/trailing rejected (not trimmed — rejected, per 2.3.1)
```

Returns `{ valid: boolean, failures: string[] }`. On failure the API responds `400` listing **which rules failed** (that is not an information leak — it is the published policy) and writes an `INPUT_VALIDATION_FAILURE` log.

Frontend: a shared `<PasswordField>` component showing live rule checkmarks + a strength meter, used on registration, reset, and change-password. The frontend check is UX only; the backend is authoritative and is what the demo should prove (send a bad password with curl and show the rejection).

### 5.2 Hashing — 2.1.3

- Raise `SALT_ROUNDS` from 10 → **12** in `backend/security/passwordPolicy.js` (single constant, exported; delete the duplicates in `userAccountService.js:9` and `prisma/seed.js:4`).
- All hashing goes through `hashPassword()` / `verifyPassword()` helpers so the cost factor is changed in exactly one place.
- Security answers use the same bcrypt helper (§5.6).
- Document for the report: bcrypt = adaptive, per-password random salt, deliberately slow. Contrast with the SHA-256 the codebase used before — the existing comment at `userAccountService.js:24-30` already explains this well; keep it.

### 5.3 Generic failure + timing — 2.1.4, 2.1.2

Rewrite `loginUser`:

- Single lookup against `UserAccount` by email (no more three-table cascade).
- **User not found → still run `bcrypt.compare(password, DUMMY_HASH)`** before returning, so response time doesn't reveal whether the email exists.
- Every credential failure returns the **same** status and body: `401 { error: "Invalid username and/or password." }` — wrong password, unknown email, locked account, disabled account, and NGO-pending-approval all collapse to this one response.
  - *Trade-off, stated deliberately:* an NGO whose account is still pending gets a confusing message. Mitigation: the registration confirmation screen and the approval email tell them the account is pending, so the information reaches them through an authenticated-by-email channel instead of an anonymous login probe. This is the correct reading of 2.1.4.
- `POST /register` currently returns `409 "Email already registered."` → account enumeration. Change to a generic `200 "If this email is available, your account has been created — check your inbox."`, with the real outcome delivered by email. (Optional; note it in the report either way.)

### 5.4 Account lockout — 2.1.8

In `loginUser`, inside a transaction:

```
on failure:
  failedLoginAttempts += 1
  failedAttemptsSinceLogin += 1
  lastFailedLoginAt = now, lastFailedLoginIp = req.ip
  if failedLoginAttempts >= 5:
      lockedUntil = now + 15 minutes
      log ACCOUNT_LOCKED (severity WARN)
  log LOGIN_FAILURE

on success (and not locked):
  failedLoginAttempts = 0
  lockedUntil = null
  // capture previous lastLoginAt/lastFailedLoginAt BEFORE overwriting — see 2.1.12
  lastLoginAt = now, lastLoginIp = req.ip
  failedAttemptsSinceLogin = 0
  log LOGIN_SUCCESS

on login attempt while lockedUntil > now:
  return the SAME generic 401
  log LOGIN_FAILURE with metadata { reason: "locked" }
  do NOT extend the lock (extending turns lockout into a permanent DoS)
```

**Justify the 15 minutes in the report** — the rubric explicitly asks for a duration "sufficient to discourage brute force… but not so long as to allow a denial-of-service." 5 attempts / 15 min caps an attacker at 480 guesses per day per account, which is useless against a 12-char policy password, while a locked-out legitimate user waits at most one coffee break. Add an admin **manual unlock** button (§9) so there is a recovery path, and log `ACCOUNT_UNLOCKED`.

Complement with **IP-based rate limiting** (`express-rate-limit`) on `/login`, `/register`, `/forgot-password`, and `/reset-password`: 20 requests / 15 min / IP. This blunts password *spraying* (one guess against many accounts), which per-account lockout cannot see, and reduces the DoS surface of lockout itself.

### 5.5 Password history + minimum age — 2.1.10, 2.1.11

**Re-use prevention (2.1.10).** On every password set, `bcrypt.compare` the new password against the **last 5** `PasswordHistory` hashes for that account plus the current hash. Any match → `400 "This password has been used recently. Choose a different one."` + `PASSWORD_REUSE_REJECTED` log. On success, insert the new hash into history and prune to 5.

**Minimum age (2.1.11).** Reject a change when `now - passwordChangedAt < 24h`: `400 "Your password was changed less than 24 hours ago and cannot be changed again yet."` + `PASSWORD_MIN_AGE_REJECTED` log.

Where the min-age rule applies:
- Self-service change-password: **enforced**.
- Forgot-password reset: **enforced** — otherwise an attacker (or a user cycling passwords) simply routes around the control via the reset flow, defeating its purpose.
- Admin-provisioned or admin-reset accounts: bypassed **once**, via `mustChangePassword = true`, which is cleared on first change. This is the standard escape hatch and gives you a demonstrable exception path.

> **Demo consideration — read this before demo day.** To show 2.1.11 you need two accounts: one whose `passwordChangedAt` is >24h old (change succeeds) and one that is fresh (change is rejected). Seed the "old" one with a backdated `passwordChangedAt`. Put both in the pre-demo checklist (§12).

### 5.6 Security questions — 2.1.9

The rubric's whole point is **answer entropy**. Curated catalogue in `backend/security/securityQuestions.js`, each with a rationale you can defend:

| Key | Question | Why the answer space is large |
|---|---|---|
| `street_age_ten` | What was the name of the street you lived on when you were ten years old? | Millions of street names; not on a social profile |
| `first_concert` | What was the first live concert or performance you attended? | Long tail of artists + venues |
| `first_employer` | What was the name of your first employer? | Long tail; not a public form field |
| `childhood_phone` | What were the last four digits of your childhood phone number? | 10,000 uniform outcomes; genuinely random |
| `teacher_grade_school` | What was the surname of your favourite grade-school teacher? | Large surname space, not publicly indexed |
| `first_pet_vet` | What was the name of the veterinary clinic your first pet went to? | Compound, low guessability |

**Explicitly excluded, and say so in the report:** favourite book (`The Bible`, `Harry Potter`), favourite colour (~11 realistic answers), mother's maiden name (public record), high school (inferable from a profile), favourite food. The rubric names "favorite book" as the bad example — show that you removed exactly that class of question.

Rules:
- Every account picks **2 distinct** questions at registration (and admin-created accounts are forced to set them at first login).
- Answers normalized (`trim` → collapse internal whitespace → lowercase) then **bcrypt-hashed**. Never stored or logged in plaintext, never returned by any endpoint.
- Answer must be ≥ 4 characters; reject a denylist of degenerate answers (`n/a`, `none`, `test`, `asdf`, `1234`).
- Reset flow: `POST /forgot-password` (email) → email delivers the existing single-use token → `GET /reset-password?token=…` renders **both questions** → user must answer **both correctly** *and* hold a valid token before the new-password form unlocks. Two factors, and it keeps the good token design already built.
- **3 wrong answer attempts** invalidates the token and locks the reset for 15 minutes. Log `SECURITY_ANSWER_FAILURE` each time; `ACCOUNT_LOCKED` on the third.
- Answer verification returns a single generic failure for "wrong answer 1", "wrong answer 2", and "both wrong" — same principle as 2.1.4.

### 5.7 Re-authentication before critical operations — 2.1.13

New: `POST /auth/reauth` — body `{ currentPassword }`. On success, mint a **re-auth token**: signed JWT, 5-minute expiry, bound to `accountId` + `tokenVersion`, claim `purpose: "reauth"`. Returned to the client and sent back in an `X-Reauth-Token` header on the sensitive request. Log `REAUTH_SUCCESS` / `REAUTH_FAILURE`. A failed re-auth counts toward the lockout counter.

Operations flagged `reauth: true` in the access-control policy table:

- `POST /auth/change-password` (**required by the rubric**)
- `POST /admin/users` — create admin or NGO account
- `DELETE /admin/users/:id` — disable an account
- `PATCH /admin/users/:id/role` — change a role
- `POST /admin/users/:id/unlock`
- `DELETE /posts/:postId/permanent` — irreversible deletion
- `POST /refunds/issue` — moves money

Because re-auth is a *policy-table flag*, adding it to a new endpoint is a one-line change and it is enforced by the same single component as everything else (2.2.1 reinforced).

### 5.8 Last-use reporting — 2.1.12

On successful login, read `lastLoginAt`, `lastLoginIp`, `lastFailedLoginAt`, `lastFailedLoginIp`, `failedAttemptsSinceLogin` **before** overwriting them, and return them in the login response as `previousAccess`. Render an unmissable banner on the post-login landing page of all three roles (`Dashboard`, `DonorHomepage`, `AdminHomepage`):

```
┌───────────────────────────────────────────────────────────────┐
│  Last successful sign-in:  09 Aug 2026, 14:32  from 192.168.1.7│
│  Last failed sign-in:      09 Aug 2026, 14:29  from 203.0.113.9 │
│  ⚠ 3 failed sign-in attempts since your last successful login.  │
│  Not you?  [ Change my password ]                              │
└───────────────────────────────────────────────────────────────┘
```

New users (first-ever login) see "This is your first sign-in." The warning row only renders when `failedAttemptsSinceLogin > 0`, which makes it stand out during the demo.

### 5.9 Obscured password entry — 2.1.7

Audit every password input for `type="password"`: `Login.jsx:72` ✅, plus `NgoRegistration.jsx`, `DonorRegistration.jsx`, `ResetPassword.jsx`, and the new `ChangePassword` and `AdminCreateUser` forms. Ship a shared `<PasswordField>` that:
- defaults to `type="password"`,
- offers an eye-icon toggle (explicit user action, hidden by default),
- sets `autoComplete="new-password"` / `"current-password"` appropriately,
- sets `spellCheck={false}` and `autoCorrect="off"`.

### 5.10 Session hardening (supports 2.1.1, 2.1.2)

- JWT expiry **7 days → 30 minutes**, with a sliding refresh on activity.
- Add `tokenVersion` to the payload; the access-control middleware rejects a token whose `tv` ≠ the account's current `tokenVersion`. Increment `tokenVersion` on logout, password change, role change, and account disable — this gives **real** server-side revocation (today, logout is cosmetic and a stolen token lives 7 days).
- `POST /auth/logout` increments `tokenVersion` and logs `LOGOUT`.
- **Recommended, and worth the marks:** move the JWT out of `localStorage` into an `httpOnly; Secure; SameSite=Strict` cookie, so XSS cannot read it. CORS already sets `credentials: true`; the frontend needs `credentials: "include"` in `apiFetch`. **Caveat:** cookie auth reintroduces CSRF, so this must ship together with a double-submit CSRF token on all state-changing requests. If the schedule is tight, keep `localStorage` + 30-minute expiry and document the trade-off — but the cookie route is the stronger answer and CSRF protection is ~40 lines.

---

## 6. Phase 2 — Authorization / access control (§2.2, 6 points)

### 6.1 Build and mount the single component — 2.2.1

Per §3.2. Concretely:

1. Create `backend/security/accessControl.js` (policy table + matcher + middleware) and `backend/security/owners.js` (ownership resolvers).
2. In `backend/server.js`, mount `app.use(enforceAccessControl)` **once**, after body parsing and before the routers.
3. Strip `authenticate` and `authorizeRoles(...)` from every route in `postRoutes.js`, `organizationRoutes.js`, `paymentRoutes.js`, `documentRoutes.js`, `refundRoutes.js`. Route files go back to being pure `router.get(path, handler)` — a visible, screenshot-able before/after for the demo.
4. Delete `backend/middleware/authMiddleware.js` once nothing imports it.

Write the policy table as an exhaustive list covering **every** route the app exposes. Anything not listed is denied by rule 1.

### 6.2 Fail securely — 2.2.2

- **Default deny.** Unmatched route → 403, logged as `ACCESS_DENIED_NO_POLICY`. Add a startup self-check that enumerates Express's registered routes and warns loudly if any lacks a policy — so a teammate adding a route in week 13 cannot accidentally ship it unprotected.
- Ownership resolver throws (bad UUID, DB down, missing row) → **deny**, never allow. Wrap in try/catch that returns `false`.
- Unknown/absent role → deny.
- Locked, disabled, or pending account with a still-valid token → deny (checked on every request, not just at login).
- Close **every IDOR in §2.3** by declaring an `owner` resolver on: `PUT/DELETE /posts/:postId`, `GET /posts/:postId` (visibility rule: `Approved` → any authenticated user; anything else → owning org or admin only), `GET /documents/:postId`, `GET /documents/download/:documentId`, `GET /payments/:paymentId`, `GET /payments/history/:postId`, `GET /refunds/:refundId`, `GET /refunds/history/:postId`, `POST /refunds/issue`.
- Keep returning **404, not 403**, when a user asks for a resource they do not own — a 403 confirms the row exists (resource enumeration). Log it as `ACCESS_DENIED_OWNERSHIP` regardless, so admins still see the truth.

### 6.3 Business-rule enforcement — 2.2.3

New: `backend/security/businessRules.js`, invoked from the controllers (rules are domain logic, not access control — keeping them separate keeps 2.2.1's "single component" claim honest).

**Post lifecycle state machine.** Legal transitions only:

```
Pending    → Approved | Unapproved         (admin only)
Unapproved → Pending                        (owning org, on resubmit)
Approved   → Edited                         (owning org, on edit)
Edited     → Approved | Unapproved          (admin only)
any        → Deleted                        (owning org or admin)
Deleted    → (terminal — no transition out)
```

Anything else → `409 "That change is not allowed for this project's current state."` + log. This kills the current bug where a `Deleted` post can be flipped back to `Approved`.

**Contribution rules.**
- Only on posts with `overallStatus = "Approved"`.
- Only when the relevant `PostSupportOption.status = "Open"` / the `PostInKindItem` is `Open`.
- Rejected if `endDate` has passed.
- The `inKindItemId` must belong to *this* post (currently unchecked — you can increment another project's item).
- **Totals only increment when a contribution reaches `Confirmed`**, not on creation. Fix `addContribution` (`postController.js:573-635`) and add `PATCH /contributions/:id/status` restricted to the owning org, which does the increment inside a transaction. This also fixes the "anyone can inflate a fundraising bar" defect.
- An NGO cannot confirm a contribution to another org's post.

**Payment rules.**
- Fees are **computed server-side** from the post and the requested contribution — 3% monetary, ₱50/volunteer capped at ₱500, 3% in-kind. Client-supplied `monetaryFee`/`volunteerFee`/`inKindFee` are **ignored entirely** (not "validated" — ignored).
- `POST /payments/confirm` must take `postId` from `paymentIntent.metadata`, not the request body, and must verify `metadata.userId === req.user.id`. Mismatch → 403 + `PAYMENT_CONFIRM_REJECTED`.
- Reject confirmation of an already-recorded `paymentIntentId` (the unique index catches it; return 409 rather than a 500).

**Refund rules.**
- Only for a payment whose `status = "succeeded"` and `refundIntentId IS NULL`.
- Only by the org that owns the post, or an admin.
- Only when the linked contribution is `Declined`, or the actor is an admin with a stated reason.
- Refund amount ≤ original payment total.
- Requires re-auth (§5.7).

**Registration/approval rules.**
- An NGO with `status != Active` cannot log in or create posts (enforced centrally now, not in `loginUser`).
- Only an admin transitions an org `Pending → Active | Rejected`.
- A donor cannot self-elevate: the `role` field is **never** read from a registration request body. `POST /register` hard-codes `donor`; `POST /organizations/register` hard-codes `ngo`; `admin` can only be created by an existing admin through `POST /admin/users`. (Today `registerUser` reads `role` from the body and allowlists it to donor/ngo — correct, but make it structurally impossible rather than allowlist-dependent.)

**Also fix while in here:** the two runtime bugs in `refundController.js` — replace `require("stripe")` with a top-level ESM `import` (line 15), and drop the non-existent `payment.amount` from the two `select` blocks (lines 117, 154).

---

## 7. Phase 3 — Data validation (§2.3, 6 points)

### 7.1 Reject, never sanitize — 2.3.1

Adopt **zod** (ESM-native, schema-per-endpoint, composes well) with a single `validate(schema)` middleware in `backend/middleware/validate.js`:

```js
export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) {
    logSecurityEvent(req, {
      eventType: "INPUT_VALIDATION_FAILURE",
      outcome: "FAILURE",
      severity: "WARN",
      // field paths + rule names only — NEVER the rejected value (it may be a password)
      metadata: { fields: result.error.issues.map(i => ({
        path: i.path.join("."), rule: i.code })) },
    });
    return res.status(400).json({
      error: { message: "The information you submitted was rejected.",
               code: "VALIDATION_FAILED",
               fields: result.error.issues.map(i => i.path.join(".")) },
    });
  }
  req.validated = result.data;   // controllers read req.validated, never req.body
  next();
};
```

Every schema uses `.strict()` so **unknown keys are rejected**, not stripped — this is both 2.3.1 compliance and mass-assignment defence (today, `req.body` is spread into Prisma `create`/`update` calls in several places).

**Remove the existing sanitizing/coercing behaviour** — this is the part graders look for:

| Location | Today (sanitizes) | Change to (rejects) |
|---|---|---|
| `postController.js:11` `normalizeBudgetBreakdown` | Bad JSON / bad array silently becomes a hardcoded default breakdown | `400` — malformed budget breakdown |
| `postController.js:30-34` | Items with a falsy label or ≤0 percentage are silently dropped | `400` — each item must have a label and a positive percentage |
| `postController.js:46-53` | Percentages are silently rescaled to sum to 100 | `400` unless they already sum to exactly 100 |
| `postController.js:159-161` | In-kind items failing the shape check are silently filtered out | `400` — every in-kind item must be well-formed |
| `postController.js:581,611,624` | `parseFloat` / `Math.round` coerce whatever arrives | Schema requires a real number in range; no coercion |
| `postController.js:513-516` | `JSON.parse(x \|\| "[]")` swallows malformed JSON | `400` on unparseable multipart JSON fields |
| `paymentController.js:155-158` | `Math.max(0, parseFloat(x) \|\| 0)` turns garbage into 0 | Values come from server-side computation, not the client, at all |
| `userAccountService.js:154` | Missing `orgName` silently becomes `"First Last"` | `400` — organization name is required |

Trimming is the one deliberate exception, and only on *identity* fields (email, names) where it is normalization rather than repair — and we still **reject** a password with leading/trailing whitespace rather than trim it.

### 7.2 Range validation — 2.3.2

| Field | Rule |
|---|---|
| `amount` (contribution) | number, > 0, ≤ 1,000,000, ≤ 2 decimal places |
| `targetAmount` | number, ≥ 100, ≤ 10,000,000 |
| `volunteerCount`, `targetCount` | integer, ≥ 1, ≤ 10,000 |
| `quantity`, `targetQuantity` | number, > 0, ≤ 1,000,000 |
| `pricePerUnit` | number, ≥ 0, ≤ 1,000,000 |
| `percentage` (budget) | integer, 0–100; the set must sum to exactly 100 |
| `startDate` / `endDate` | valid ISO 8601; `startDate ≤ endDate`; both within `[today − 1y, today + 5y]` |
| `startTime` / `endTime` | strict `HH:MM` 24-hour |
| `priority` | exactly one of `High` / `Medium` / `Low` |
| `causes` | non-empty array, ≤ 5 entries, each a valid `CauseEnum`, no duplicates |
| `country` | valid `ASEANCountry` |
| `overallStatus`, `fileType`, `type`, `status` | validated against the Prisma enum, plus the state machine in §6.3 |
| all `:id` path params | **strict UUID v4 format** — currently a malformed id reaches Prisma and throws a 500, which is also a 2.4.1 violation |
| `page` / `limit` (new pagination) | integers, `1 ≤ limit ≤ 100` |

### 7.3 Length validation — 2.3.3

| Field | Min | Max |
|---|---|---|
| `email` | 5 | 254 (RFC 5321) |
| `firstName`, `lastName`, `surname` | 1 | 100 |
| `orgName` | 2 | 200 |
| `password` | 12 | 64 |
| `bio` | 0 | 1,000 |
| `description` (post) | 0 | 5,000 |
| `description` (document) | 0 | 500 |
| `location` | 0 | 200 |
| `projectName` | 3 | 200 |
| `itemName` | 1 | 100 |
| `unit` | 0 | 20 |
| `donorName` | 1 | 150 |
| security answer | 4 | 100 |
| `refundReason` | 0 | 500 |
| uploaded filename | 1 | 255 |

Plus transport-level limits in `server.js`:
- `express.json({ limit: "100kb" })` and `express.urlencoded({ limit: "100kb", extended: true })` — explicit, not defaulted.
- Reject any request with more than 50 top-level body keys (cheap algorithmic-complexity guard).

**File uploads** (`backend/middleware/uploadMiddleware.js`):
- Size cap **50 MB → 10 MB**.
- Max 1 file per request (already effectively true via `.single()`).
- Keep the MIME allowlist, but **also** check the extension against an allowlist *and* verify the real magic bytes with the `file-type` package. Reject on any mismatch — a client-declared `Content-Type` is attacker-controlled and today it is the only check.
- Store under a **generated UUID filename** and never reflect the client's filename into the path. Today `uploadMiddleware.js:19-24` builds the stored name from `file.originalname`, so a name like `../../server.js` or a double extension (`invoice.pdf.exe`) is partially attacker-influenced. Keep the original name in the DB `fileName` column for display only.
- Reject filenames that don't match `^[A-Za-z0-9._ -]{1,255}$` rather than rewriting them (2.3.1).
- Serve downloads with `Content-Disposition: attachment` and `X-Content-Type-Options: nosniff`.

---

## 8. Phase 4 — Error handling and logging (§2.4, 14 points)

### 8.1 Central error handling — 2.4.1

1. `backend/errors/AppError.js` — a small class carrying `statusCode`, a **client-safe** `message`, and a `code`. Anything that is *not* an `AppError` is treated as unexpected.
2. Rewrite the error handler in `server.js:53`:

```js
app.use((err, req, res, next) => {
  const errorId = crypto.randomUUID();
  const isKnown = err instanceof AppError;

  // FULL detail, server-side only
  logSecurityEvent(req, {
    eventType: "UNHANDLED_ERROR",
    outcome: "FAILURE",
    severity: isKnown ? "WARN" : "CRITICAL",
    message: err.message,
    metadata: { errorId, stack: err.stack, code: err.code },
  });

  // GENERIC detail to the client — no message, no code, no stack, no meta
  res.status(isKnown ? err.statusCode : 500).json({
    error: {
      message: isKnown ? err.message : "Something went wrong on our end.",
      code: isKnown ? err.code : "INTERNAL_ERROR",
      errorId,   // user can quote this to support; admin finds it in the log
    },
  });
});
```

3. **Delete every leaky response.** Search for `err.message`, `error.stack`, `err.code`, `err.meta`, `err.toString()` in responses. Known offenders: `postController.js:254-258` (leaks `message` + `code` + Prisma `meta`), `:289, :309, :328, :348, :368, :408, :428, :447, :491, :649, :779, :892`; `paymentController.js:102, 177-180, 226, 257, 307, 356`; `refundController.js:96, 132, 173`; `authController.js:10, 21`. Replace all with `next(err)` or `next(new AppError(...))`.
4. Special-case Prisma errors *server-side*: `P2002` → "That value is already in use." · `P2025` → 404 · `P2003` → 409. Never forward Prisma's own message, which names tables and columns.
5. Set `app.disable("x-powered-by")`, add **helmet** (`Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, HSTS in production).
6. Run the demo with `NODE_ENV=production`, and delete the two `NODE_ENV === "development"` conditional leaks (`postController.js:257`, `paymentController.js:179`) rather than relying on the env var being set correctly.
7. Add `process.on("unhandledRejection")` / `("uncaughtException")` handlers that log and exit cleanly instead of printing a stack to stdout.

### 8.2 Generic messages and custom error pages — 2.4.2

**Backend:** one response envelope everywhere — `{ error: { message, code, errorId? } }`. A fixed catalogue of user-facing messages; nothing dynamic, nothing that names a table, a file path, or a library.

**Frontend:**
- A React **error boundary** at the app root, rendering a branded "Something went wrong" page with the `errorId` — never a component stack.
- Custom pages: `NotFound` (404), `Forbidden` (403), `Unauthorized` (401 → redirect to login with a "your session expired" notice), `ServerError` (500).
- Add the missing catch-all route: `<Route path="*" element={<NotFound />} />` in `frontend/src/App.jsx`. Today an unknown URL renders a blank white page.
- Rewrite `apiFetch` (`frontend/src/config/api.js:38-41`). It currently throws `` `API Error: ${response.status} ${response.statusText}` `` and pages surface that string to the user. It must parse the error envelope and return the friendly `message`, and route 401 → login, 403 → Forbidden page.
- Remove `console.error("API Fetch Error:", error)` at `api.js:46` from production builds (Vite: strip via build config) — it leaks response shapes into the browser console.

### 8.3 Security event logging — 2.4.3, 2.4.5, 2.4.6, 2.4.7

Implement per §3.3. Wiring points:

| Requirement | Where the call lives |
|---|---|
| 2.4.6 auth attempts | `loginUser` — success **and** every failure (unknown email, wrong password, locked, disabled). Plus logout, registration, password change/reset, security-answer checks, re-auth |
| 2.4.7 access-control failures | Inside `enforceAccessControl` — one place, all five denial kinds. Successes are logged too, but only for admin/financial routes (`ACCESS_GRANTED_SENSITIVE`), to keep the table readable |
| 2.4.5 validation failures | Inside `validate()` middleware — one place, every endpoint |
| 2.4.3 success **and** failure | The event catalogue in §3.3 is deliberately paired: `LOGIN_SUCCESS`/`LOGIN_FAILURE`, `PASSWORD_CHANGE_SUCCESS`/`_FAILURE`, `REAUTH_SUCCESS`/`_FAILURE`, `PAYMENT_CONFIRMED`/`PAYMENT_CONFIRM_REJECTED`, `REFUND_ISSUED`/`REFUND_REJECTED`. Show this table to the grader |

Because logging sits in the three shared middlewares (access control, validation, error handler) plus the auth service, coverage is structural — a new endpoint is logged automatically.

### 8.4 Admin-only log viewer — 2.4.4

**API** — `backend/routes/securityLogRoutes.js`:
- `GET /security-logs` — paginated (default 50, max 100), newest first. Filters: `from`, `to`, `eventType`, `outcome`, `severity`, `actorEmail`, `ipAddress`, `targetId`, free-text `q` on `message`.
- `GET /security-logs/event-types` — populates the filter dropdown.
- `GET /security-logs/summary` — counts by outcome/severity for the last 24h, for a small dashboard strip.
- **No POST, PATCH, PUT, or DELETE.** The rubric says *read-only*; there must be no write path to remove.
- Policy-table entry: `roles: ["admin"]`. A `ngo` or `donor` token gets 403 **and generates an `ACCESS_DENIED_ROLE` entry in the very log they tried to read** — a genuinely satisfying thing to demo.
- Every successful view writes `SECURITY_LOG_VIEWED` (who read the logs is itself a security event).

**Frontend** — `frontend/src/pages/SecurityLogs.jsx` at `/admin/security-logs`, reachable from a new card on `AdminHomepage.jsx` (which currently has three cards; add a fourth):
- Table: timestamp · severity badge · event type · outcome · actor (email + role) · IP · target · message.
- Filter bar matching the API filters, a date-range picker, and quick presets: **Failed logins (24h)** · **Access denials** · **Validation failures** · **Admin actions** · **Financial events**.
- Row expander showing the `metadata` JSON.
- CSV export of the current filtered view (read-only, admin-only).
- Colour coding: `CRITICAL` red, `WARN` amber, `INFO` grey — makes the demo legible from the back of the room.

---

## 9. Phase 5 — Admin account management (Part 1 CRUD requirements)

The rubric's Part 1 requires the administrator to *"Add new Administrator and Role A accounts"* and *"Assign/Change user roles."* None of this exists today. New endpoints, all admin-only and all `reauth: true`:

| Endpoint | Purpose |
|---|---|
| `GET /admin/users` | List all accounts — filter by role, status, email; paginated |
| `POST /admin/users` | Create an `admin` or `ngo` account. Generates a policy-compliant temporary password, sets `mustChangePassword = true`. Logs `USER_CREATED` |
| `PATCH /admin/users/:id/role` | Change role between `admin` and `ngo`. Increments `tokenVersion` so existing sessions die immediately. Logs `USER_ROLE_CHANGED` |
| `DELETE /admin/users/:id` | **Soft**-delete → `status = Disabled`, `tokenVersion++`. Preserves FKs and the audit trail. Logs `USER_DELETED` |
| `POST /admin/users/:id/unlock` | Clear `lockedUntil` + `failedLoginAttempts`. Logs `ACCOUNT_UNLOCKED` |
| `POST /admin/users/:id/force-reset` | Set `mustChangePassword`, `tokenVersion++`. Logs `PASSWORD_RESET_REQUESTED` |

Guard rails, all enforced server-side:
- An admin **cannot** demote, disable, or delete their own account (prevents locking out the last admin).
- The system refuses to disable or demote the **last active admin**.
- `donor` accounts cannot be created through this endpoint (donors self-register, per the rubric).
- Admin cannot read or set another user's password — only force a reset.

**Frontend:** `frontend/src/pages/AdminUserManagement.jsx` at `/admin/user-management`, plus a fifth card on `AdminHomepage.jsx`.

**Change password (all roles)** — `POST /auth/change-password`, body `{ currentPassword, newPassword, confirmPassword }` + `X-Reauth-Token`. Runs the full stack: re-auth (2.1.13) → complexity+length (2.1.5/2.1.6) → history (2.1.10) → min-age (2.1.11) → `tokenVersion++` → log. Reachable from a `ChangePassword.jsx` page linked in the navbar for **all three roles**.

---

## 10. Phase 6 — Additional hardening (beyond the rubric; cheap marks in the report)

| Item | Effort | Value |
|---|---|---|
| `helmet` security headers + CSP | 15 min | Clickjacking, MIME sniffing, XSS mitigation |
| `express-rate-limit` on auth endpoints | 30 min | Password spraying, lockout-DoS |
| JWT → `httpOnly` cookie + CSRF double-submit token | 3–4 h | Removes XSS token theft — the single biggest remaining risk |
| `npm audit fix` on both packages | 30 min | Known CVEs in dependencies |
| Restrict CORS to an explicit origin list | 10 min | Already close; make it strict and log rejections |
| Seed passwords from env vars, not source | 20 min | Removes `admin123` from the repo |
| Prisma connection pooling limits | 15 min | Resource-exhaustion DoS |
| `Cache-Control: no-store` on authenticated responses | 10 min | Prevents browser/proxy caching of private data |

---

## 11. File-change inventory

**New — backend**
```
backend/security/accessControl.js       single site-wide authz component (2.2.1)
backend/security/owners.js              ownership resolvers (2.2.2)
backend/security/passwordPolicy.js      complexity, length, history, hashing (2.1.3/5/6/10)
backend/security/securityQuestions.js   curated high-entropy catalogue (2.1.9)
backend/security/securityLog.js         logging service + redaction (2.4.3-2.4.7)
backend/security/businessRules.js       state machines, fee computation (2.2.3)
backend/middleware/validate.js          zod validate() (2.3.1-2.3.3)
backend/schemas/*.schema.js             one zod schema per endpoint
backend/errors/AppError.js              client-safe error type (2.4.1)
backend/controllers/adminUserController.js
backend/controllers/securityLogController.js
backend/routes/adminUserRoutes.js
backend/routes/securityLogRoutes.js
backend/prisma/migrations/<ts>_security_controls/
backend/scripts/backfill-user-accounts.js
```

**Modified — backend**
```
backend/server.js                 mount access control, helmet, rate limit, body limits,
                                  env guard, rewritten error handler, 404 handler
backend/services/userAccountService.js   rewritten around UserAccount: lockout, history,
                                  min-age, last-use capture, generic failures, re-auth
backend/controllers/*.js          remove all err.message leaks; read req.validated;
                                  call businessRules; add logging
backend/routes/*.js               strip per-route auth middleware (now central)
backend/middleware/uploadMiddleware.js   10 MB, magic-byte check, UUID filenames
backend/prisma/schema.prisma      UserAccount, PasswordHistory, SecurityAnswer, SecurityLog
backend/prisma/seed.js            policy-compliant passwords from env; demo fixtures
backend/middleware/authMiddleware.js     DELETE once unreferenced
```

**New — frontend**
```
frontend/src/context/AuthContext.jsx        server-verified session (GET /auth/me)
frontend/src/components/ProtectedRoute.jsx  single route guard
frontend/src/components/PasswordField.jsx   obscured input + policy meter (2.1.7)
frontend/src/components/LastAccessBanner.jsx (2.1.12)
frontend/src/components/ErrorBoundary.jsx   (2.4.2)
frontend/src/components/ReauthModal.jsx     (2.1.13)
frontend/src/pages/ChangePassword.jsx
frontend/src/pages/SecurityQuestionsSetup.jsx
frontend/src/pages/SecurityLogs.jsx         admin-only viewer (2.4.4)
frontend/src/pages/AdminUserManagement.jsx
frontend/src/pages/errors/{NotFound,Forbidden,Unauthorized,ServerError}.jsx
```

**Modified — frontend**
```
frontend/src/App.jsx              replace RequireRole with ProtectedRoute; add "*" route;
                                  wrap in ErrorBoundary + AuthProvider
frontend/src/config/api.js        parse error envelope, friendly messages, 401/403 routing
frontend/src/pages/Login.jsx      lockout messaging, last-access banner hand-off
frontend/src/pages/{NgoRegistration,DonorRegistration,ResetPassword}.jsx
                                  PasswordField, policy feedback, security questions
frontend/src/pages/AdminHomepage.jsx   cards for Security Logs + User Management
frontend/src/components/Navbar.jsx     Change Password link for all roles
```

---

## 12. Pre-demo setup (rubric 1.1 — 6 points)

Seed script must create at minimum:

| # | Role | Email | Notes |
|---|---|---|---|
| 1.1.1 | Website Administrator | `admin@bayanihub.local` | Policy-compliant password from `SEED_ADMIN_PASSWORD`; 2 security questions set; `passwordChangedAt` backdated 3 days |
| 1.1.2 | Product Manager (NGO) | `mary.angela@redcross.ph` | `status = Active`, owns several posts; `passwordChangedAt` backdated 3 days |
| 1.1.3 | Customer (Donor) | `donor@bayanihub.local` | `status = Active`; `passwordChangedAt` backdated 3 days |

Plus these **demo fixtures** — each exists specifically to make one checklist item demonstrable:

| Fixture | Demonstrates |
|---|---|
| A second NGO (`juan.santos@actionaid.ph`) owning its own posts | 2.2.2 — cross-tenant IDOR attempt |
| `locked@bayanihub.local` with `failedLoginAttempts = 5`, `lockedUntil` in the future | 2.1.8 |
| `freshpw@bayanihub.local` with `passwordChangedAt = now` | 2.1.11 rejection path |
| A second admin account | 2.1.13 + last-admin guard rails |
| An NGO with `status = Pending` | 2.2.3 — pending accounts cannot log in |
| ~40 pre-seeded `SecurityLog` rows across all severities and event types | 2.4.3, 2.4.4 — a populated, filterable viewer |
| A `Deleted` post and an `Unapproved` post | 2.2.2 visibility rules, 2.2.3 state machine |
| A donor with a prior failed login + a prior success | 2.1.12 banner with a non-zero failure count |

**Also confirm before the demo:** `NODE_ENV=production`; secrets rotated and out of git history; `prisma migrate deploy` clean on a fresh DB; the seed is idempotent (safe to re-run mid-demo).

---

## 13. Demo script — one row per checklist item

| # | What to do | Expected result |
|---|---|---|
| 1.1.1–3 | Log in as each of the three accounts | Three distinct dashboards, each showing only its own capabilities |
| 2.1.1 | Log out, then hit `/admin`, `/dashboard`, `/donor` directly. Then `curl` `/posts` with no `Authorization` header | Redirected to login; API returns 401. Then show `/posts/approved` works publicly — the deliberate exception |
| 2.1.2 | Stop the DB and attempt login; also present a JWT signed with the wrong key | Access denied, generic message — never "allowed by default". Show the boot guard refusing to start with a missing `JWT_SECRET` |
| 2.1.3 | `SELECT email, "passwordHash" FROM "UserAccount" LIMIT 3` | `$2b$12$…` bcrypt hashes; two accounts with the **same** password show **different** hashes → per-password salting |
| 2.1.4 | Log in with an unknown email, then a known email + wrong password | Byte-identical `"Invalid username and/or password."` in both cases. Show near-identical response times (the dummy-compare) |
| 2.1.5 | Register with `password1` | Rejected, listing the unmet complexity rules |
| 2.1.6 | Try an 8-char password, then a 70-char one | Both rejected — under min, over max |
| 2.1.7 | Type into every password field on all forms | Dots only; toggle is opt-in and defaults to hidden |
| 2.1.8 | Fail login 5× on the donor account, then use the **correct** password | 6th attempt fails with the same generic message. Show `lockedUntil` in the DB and the `ACCOUNT_LOCKED` row in the log viewer. Wait/adjust the clock → login succeeds. Then show admin manual unlock |
| 2.1.9 | Walk the forgot-password flow | Show the question catalogue and explain why "favourite book" was excluded. Wrong answers → generic failure; 3 wrong → reset locked. Show `answerHash` is bcrypt in the DB |
| 2.1.10 | Change password to a previously used one | Rejected: "This password has been used recently." Show the `PasswordHistory` rows |
| 2.1.11 | Change password twice in a row on `freshpw@bayanihub.local` | Second attempt rejected on min-age. Then do it on the backdated account → succeeds |
| 2.1.12 | Fail login 3×, then succeed | Banner shows previous successful sign-in time + IP, previous failed attempt, and "3 failed attempts since your last login" |
| 2.1.13 | Open Change Password | Re-auth modal demands the current password first. Show the request rejected without a valid `X-Reauth-Token`. Repeat for admin user-deletion |
| 2.2.1 | Open `backend/security/accessControl.js` beside the git diff of the route files | One policy table; route files carry **no** auth middleware. Show a deliberately unregistered route returning 403 by default |
| 2.2.2 | As NGO A, `PUT /posts/<NGO B's post id>`. As a donor, `GET /security-logs`. As a donor, `GET /payments/<someone else's id>` | All denied. Show the matching `ACCESS_DENIED_*` rows appearing live in the admin log viewer |
| 2.2.3 | Try to contribute to a `Pending` post; try `Deleted → Approved`; send `monetaryFee: 1` on a ₱100,000 donation | All rejected; the fee is recomputed server-side and the client's number is ignored |
| 2.3.1 | Send a budget breakdown summing to 87, and an in-kind item with no name | `400` rejection — show the old code path that would have silently defaulted/dropped it |
| 2.3.2 | `amount: -500`; `amount: 999999999`; `endDate` before `startDate`; `causes: ["notARealCause"]`; a malformed UUID in the path | All `400`, none reaching Prisma or producing a 500 |
| 2.3.3 | A 300-char project name; a 65-char password; a 20 MB upload; a `.exe` renamed to `.pdf` | All rejected, including the magic-byte mismatch |
| 2.4.1 | Force an internal error (e.g. stop the DB mid-request) | Client sees `{ error: { message: "Something went wrong on our end.", errorId } }` — no stack, no Prisma code, no table name. Then find that `errorId` in the admin log with the full stack |
| 2.4.2 | Visit `/this-page-does-not-exist`; trigger a 403 | Branded custom pages, generic wording, no framework error screens |
| 2.4.3 | In the log viewer, filter `LOGIN_SUCCESS` then `LOGIN_FAILURE`; `PAYMENT_CONFIRMED` then `PAYMENT_CONFIRM_REJECTED` | Both success and failure recorded for every security event family |
| 2.4.4 | As donor and as NGO, hit `/admin/security-logs` and `GET /security-logs` | 403 in both UI and API — **and the denial itself appears in the admin's log**. Show there is no write/delete endpoint |
| 2.4.5 | Submit an invalid form, then filter the log by `INPUT_VALIDATION_FAILURE` | Entry present with field paths and rule names — and **no** rejected values (so passwords never land in logs) |
| 2.4.6 | Filter by the authentication event family | Every attempt from the whole demo, success and failure, with IP, user agent, and timestamp |
| 2.4.7 | Filter by `ACCESS_DENIED_*` | Every denial from the 2.2.2 walkthrough, tagged by denial reason |

---

## 14. Testing, effort, and risk

### 14.1 Testing

- **Automated (recommended):** `vitest` + `supertest` against a test Postgres schema. Highest-value suites: `accessControl` (a table-driven matrix of role × endpoint × ownership — this directly evidences 2.2.1/2.2.2), `passwordPolicy` (accept/reject cases), `lockout` (5-strike behaviour + reset), `passwordHistory`, `minAge`, and `validation` (one reject case per schema field).
- **Manual:** the §13 script *is* the regression suite. Run it end-to-end at least twice before demo day.
- **Adversarial pass:** with the app running, try each defect in §2.3 and confirm it is now blocked. Screenshot before/after for the report — this is the most persuasive artifact you can hand a grader.

### 14.2 Suggested sequencing (3 people)

| Phase | Content | Est. | Suggested owner |
|---|---|---|---|
| 0 | Secrets, git history, env guard, README | 0.5 d | anyone — **do first** |
| 1 | `UserAccount` schema + migration + backfill | 1.5 d | backend lead |
| 2 | Auth controls 2.1.3–2.1.13 | 3 d | backend lead + 1 |
| 3 | Access control component + IDOR closure + business rules | 3 d | backend 2 |
| 4 | Validation layer + schemas | 2 d | backend 2 |
| 5 | Error handling + logging + admin log viewer | 2.5 d | full stack |
| 6 | Admin user management + change password | 1.5 d | frontend |
| 7 | Frontend: AuthContext, PasswordField, banners, error pages | 2.5 d | frontend |
| 8 | Hardening, seed fixtures, demo rehearsal, report | 2 d | all |

≈ **18–19 person-days.** Phases 3 and 4 can run in parallel with Phase 2 once Phase 1 lands.

### 14.3 Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| `UserAccount` migration breaks existing relations | High | `req.user.id` keeps meaning *profile id* (§3.1). Test the backfill on a DB copy first. Keep the migration additive and reversible until step 3 |
| Ripping per-route middleware out leaves an endpoint unguarded | High | Default-deny means an un-policied route fails **closed**, not open. Add the startup route-vs-policy self-check |
| Stricter validation breaks working frontend forms | Medium | Do backend and frontend for each form in the same commit; the §13 script exercises every form |
| Duplicate emails across the three tables block the backfill | Medium | Detect and report during backfill; resolve by hand before migrating |
| Cookie-based JWT introduces CSRF | Medium | Ship the CSRF token with it, or defer §5.10's cookie change entirely and document the trade-off |
| Committed secrets already harvested | High | Rotate everything (§4). Assume the old values are public |
| Min-password-age blocks the demo | Low | Backdate `passwordChangedAt` in the seed (§12) |
| Scope creep at the end of term | Medium | Rubric items first; §10 hardening is strictly optional |

---

## 15. What earns the marks, condensed

If time collapses, this is the priority order — it tracks the rubric's own point weighting:

1. **`UserAccount` + password policy + lockout + history + min-age + last-use + re-auth** → 26 points (§2.1). Largest block, and everything else in §2.1 depends on the unified table.
2. **Central access control + IDOR closure** → 6 points (§2.2), and it is the item most visibly *missing* today.
3. **Logging + admin viewer + central error handler** → 14 points (§2.4). Highest points-per-hour once the three shared middlewares exist, because coverage becomes automatic.
4. **zod validation layer** → 6 points (§2.3). Mechanical once the middleware exists; the schemas are the bulk of the typing.
5. **Three demo accounts + fixtures** → 6 points (§1.1). Trivial, and easy to forget until the night before.

The remaining marks come from Part 1's CRUD expectations (§9) — admin account creation and role assignment are explicitly listed there and do not exist yet.
