# CSSECDV Security Controls — Implementation and Demo Guide

**Project:** BayaniHub
**Checklist:** `Machine_Project_-_Web_App.md`
**Plan this implements:** [SECURITY_IMPLEMENTATION_PLAN.md](SECURITY_IMPLEMENTATION_PLAN.md)

This document maps every checklist item to the code that implements it and the
steps that demonstrate it. Section numbers match the rubric.

---

## Role mapping

| Rubric role | Our role | Prisma model | JWT `role` |
|---|---|---|---|
| Administrator | Admin | `Admin` | `admin` |
| Role A — Product Manager | NGO / Organization | `Organization` | `ngo` |
| Role B — Customer | Donor | `Donor` | `donor` |

**Permissions unique to each role.** The rubric requires Roles A and B to have
capabilities the other lacks.

| Capability | admin | ngo | donor |
|---|:--:|:--:|:--:|
| Create/disable admin and NGO accounts, assign roles | ✅ | ❌ | ❌ |
| Read the security log | ✅ | ❌ | ❌ |
| Approve/reject NGO registrations | ✅ | ❌ | ❌ |
| Approve/unapprove projects | ✅ | ❌ | ❌ |
| Create/edit/delete **own** projects | ❌ | ✅ | ❌ |
| Confirm/decline contributions to **own** projects | ❌ | ✅ | ❌ |
| Upload documentation to **own** projects | ❌ | ✅ | ❌ |
| Contribute to any approved project | ❌ | ❌ | ✅ |
| View **own** contribution and payment history | ❌ | ✅ (own org) | ✅ (own) |
| Change own password | ✅ | ✅ | ✅ |

---

## Architecture

Three shared components carry most of the checklist. Because they sit in the
request path rather than in each controller, coverage is structural — a new
endpoint inherits all of it without anyone remembering to add it.

```
request
   │
   ├─ helmet                    security headers
   ├─ cors                      origin allowlist
   ├─ express.json (100kb)      explicit body limit                    [2.3.3]
   ├─ rate limiter              per-IP throttling                      [2.1.8]
   │
   ├─ enforceAccessControl ◄──── THE single authorization component    [2.2.1]
   │     policy lookup → default DENY if none                          [2.2.2]
   │     JWT verify → account re-read → status → role → reauth → owner
   │     every denial logged with its specific reason                  [2.4.7]
   │
   ├─ validate(schema)   ◄────── one zod validator per endpoint   [2.3.1-2.3.3]
   │     reject, never sanitize; every failure logged                  [2.4.5]
   │
   ├─ controller                thin: no authz, no error formatting
   │
   └─ errorHandler       ◄────── the one place an error becomes a response
         AppError → its message; anything else → one fixed sentence    [2.4.1]
         full stack + errorId → security log, never the wire
```

| File | Responsibility |
|---|---|
| `backend/security/accessControl.js` | Policy table + enforcement. The complete access policy, readable in one place |
| `backend/security/owners.js` | Object-level ownership resolvers |
| `backend/security/passwordPolicy.js` | Complexity, length, hashing, history, minimum age |
| `backend/security/securityQuestions.js` | Question catalogue and answer verification |
| `backend/security/securityLog.js` | Append-only audit log, event catalogue, redaction |
| `backend/security/businessRules.js` | State machines, server-side fee computation |
| `backend/security/tokens.js` | JWT issuing/verification, purpose separation |
| `backend/security/env.js` | Boot-time configuration validation |
| `backend/middleware/validate.js` | The single validation middleware |
| `backend/middleware/errorHandler.js` | The single error-to-response boundary |

---

## 2.1 Authentication

### 2.1.1 Authentication required except where explicitly public

`enforceAccessControl` is mounted **once** in `server.js`, ahead of every
router. A request matching no policy is denied by default, so a route added
without a policy becomes unreachable rather than unprotected.

The public surface is exactly ten routes, and a test locks the list down so
adding an eleventh requires editing that test deliberately:

```
GET  /health                          POST /login
GET  /posts/approved                  POST /register
GET  /auth/security-questions         POST /organizations/register
GET  /verify-reset-token              POST /forgot-password
                                      POST /reset-password
                                      POST /reset-password/verify-answers
```

`GET /posts/approved` is the only public route returning application data, and
it returns approved projects only.

**Demo** — sign out, then visit `/admin`, `/dashboard`, `/donor` directly: each
redirects to sign-in. Then:

```bash
curl -i http://localhost:3000/posts              # 401
curl -i http://localhost:3000/posts/approved     # 200 — the deliberate exception
curl -i http://localhost:3000/security-logs      # 401
```

### 2.1.2 Authentication controls fail securely

- `security/env.js` aborts the process at boot if `JWT_SECRET` is missing,
  shorter than 32 characters, or a known placeholder. A server that cannot
  verify tokens must not start.
- `tokens.js` pins `algorithms: ["HS256"]`, closing algorithm-confusion and
  `alg: none` attacks.
- `verifyPassword` returns `false` on a malformed hash rather than throwing.
- Any exception inside the authorization path is caught and converted to a
  **denial** (`accessControl.js`, the catch at the end of the middleware).
- An account with no profile row is refused sign-in rather than half-loaded.

**Demo** — temporarily blank `JWT_SECRET` and run `npm run dev`: the server
prints why and exits. Restore it, then present a token signed with a different
key: 401.

### 2.1.3 Cryptographically strong one-way salted hashes

bcrypt at **cost 12** (raised from 10), in `security/passwordPolicy.js`. bcrypt
generates a fresh random salt per call and embeds it in the hash, so two
accounts with the same password store different hashes. `rehashIfNeeded`
transparently upgrades a legacy cost-10 hash the next time its owner signs in.

The three duplicated `password` columns on `Admin`, `Donor` and `Organization`
were dropped; authentication now lives in one `UserAccount` table.

**Demo**

```sql
SELECT email, "passwordHash" FROM "UserAccount" LIMIT 3;
```

Every value starts `$2b$12$`. Two accounts given the same password show
different hashes.

### 2.1.4 Authentication failures do not indicate which part was wrong

`loginUser` returns exactly one message, with one status code, for **every**
credential failure: unknown email, wrong password, locked account, disabled
account, and an organization awaiting approval.

```
401  { error: { message: "Invalid username and/or password." } }
```

When no account exists, the code still runs `bcrypt.compare` against a dummy
hash (`wasteTime()`), so response timing does not distinguish the cases either.

*Trade-off, stated deliberately:* an organization still awaiting approval gets
an unhelpful message here. That information reaches them through their
registration screen and approval email — channels requiring control of the
mailbox, rather than an anonymous login probe.

**Demo** — sign in with (a) an email that does not exist, (b) a real email with
a wrong password, (c) `pending.org@bayanihub.local` with its **correct**
password. All three return byte-identical responses.

### 2.1.5 Password complexity · 2.1.6 Password length

`security/passwordPolicy.js`, applied identically by registration, admin
provisioning, self-service change, and reset.

| Rule | Value |
|---|---|
| Length | 12–64 characters |
| Classes | lowercase, uppercase, digit, symbol — all four required |
| Denylist | common passwords, matched against the alphabetic core after undoing leetspeak |
| Contextual | must not contain the user's name, email local-part, or organization name |
| Structure | no single repeated character, no long sequential run |
| Whitespace | leading/trailing rejected, not trimmed |

The maximum is 64 because **bcrypt silently ignores everything past 72 bytes**.
A longer passphrase would give the user less protection than they believe, so it
is rejected rather than truncated — silently discarding half a password is the
kind of repair 2.3.1 forbids.

The denylist is the rule that earns its keep. `Password123!` satisfies every
character-class requirement and is one of the most-guessed strings in existence.
The check strips non-letters and undoes leetspeak, so `Password123!`,
`P@ssw0rd2026!`, `Qwerty12345!A` and `Adm1nistrator!` are all caught by a
handful of base words.

**Demo**

```bash
# each is rejected, with the specific unmet rules listed
Ab1!efgh          # too short
password          # too short, no classes, common
Password123!      # passes every character rule — rejected as a common base word
P@ssw0rd2026!     # leetspeak disguise — still caught
Aa1!xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # too long
```

### 2.1.7 Password entry obscured

`frontend/src/components/PasswordField.jsx`, used by every password input:
sign-in, both registrations, reset, and change. `type="password"` by default,
with an opt-in show/hide toggle that always starts hidden, plus
`spellCheck={false}` and `autoCorrect="off"` so the value is never sent to a
spell-check service.

### 2.1.8 Account lockout

**5 failed attempts → locked for 15 minutes.** Configurable via
`LOCKOUT_THRESHOLD` and `LOCKOUT_DURATION_MINUTES`.

The rubric asks for a duration "sufficient to discourage brute force… but not so
long as to allow for a denial-of-service". 5 per 15 minutes caps an attacker at
480 guesses per account per day, which is hopeless against a 12-character
policy password, while a locked-out legitimate user waits one coffee break.

Two details that matter:

- The lock is **not extended** on further attempts. Extending it would let an
  attacker keep a victim permanently locked out — turning the control itself
  into the denial-of-service it is meant to avoid.
- An administrator can unlock immediately (`POST /admin/users/:id/unlock`), so
  there is a recovery path.

Per-IP rate limiting (`middleware/rateLimit.js`) complements this: lockout stops
many guesses against one account; the rate limit stops one guess against
thousands of accounts, which lockout cannot see.

**Demo** — fail sign-in five times as the donor, then use the **correct**
password: still refused, with the same generic message. Show `lockedUntil` in
the database and the `ACCOUNT_LOCKED` entry in the admin log viewer. Then unlock
from `/admin/user-management`. `locked@bayanihub.local` is pre-locked if you
prefer to skip the five attempts.

### 2.1.9 Password reset questions supporting random answers

The rubric names "favorite book" as the bad example because the answer space
collapses. `security/securityQuestions.js` documents both the eight questions
offered **and the seven rejected, with reasons** — the rejection list is kept in
the source so the reasoning survives.

Offered (each with a documented rationale): street at age ten · first concert ·
first employer · childhood phone last four digits · grade-school teacher's
surname · first pet's veterinary clinic · a childhood nickname friends never
used · first dish cooked alone.

Rejected: favourite book · favourite colour · mother's maiden name · high school
· favourite food · pet's name · city of birth.

The reset flow requires **two independent factors**:

1. the emailed token — proves control of the mailbox (32 random bytes, stored
   only as a SHA-256 hash, single use, 24-hour expiry)
2. correct answers to both questions — 3 attempts, after which the token is
   burned

Answers are normalised (trim, collapse whitespace, lowercase) then bcrypt-hashed
at the same cost as passwords. They are never returned by any endpoint and never
logged. A wrong answer produces one generic message whether one or both were
wrong.

**Demo** — walk `/forgot-password`. Show the catalogue and explain the
exclusions. Answer wrongly three times: the link dies. Then
`SELECT "answerHash" FROM "SecurityAnswer" LIMIT 2;` — bcrypt, not plaintext.

### 2.1.10 Prevent password re-use

`PasswordHistory` keeps the last 5 hashes per account. On every change, the
candidate is compared against the current password plus all 5. Any match is
refused and logged as `PASSWORD_REUSE_REJECTED`.

### 2.1.11 Passwords at least one day old before they can be changed

`passwordChangedAt` on `UserAccount`; a change within 24 hours is refused.

The rule applies to the self-service change **and** the reset flow. If reset
skipped it, anyone could route around the control by requesting a reset email —
and it would protect nothing. The single exception is `mustChangePassword`,
which lets an admin-provisioned or admin-reset account set its own password
immediately; the flag is consumed on first use.

2.1.10 and 2.1.11 only work as a pair: without the minimum age, someone could
cycle through five throwaway passwords in one sitting and return to a favourite.

**Demo** — change the password on `freshpw@bayanihub.local` (set today):
refused, with the time it becomes possible. Repeat on the donor account
(backdated 20 days): succeeds.

### 2.1.12 Last use reported at next login

`UserAccount` records `lastLoginAt/Ip`, `lastFailedLoginAt/Ip`, and
`failedAttemptsSinceLogin`. On a successful sign-in the **previous** values are
captured before being overwritten and returned as `previousAccess`.
`LastAccessBanner` renders them on all three landing pages; the failure row is
styled as a warning with a direct link to change the password, because noticing
is only useful if acting is easy.

**Demo** — sign in as `mary.angela@redcross.ph`. The banner shows the previous
sign-in, the last failed attempt, and "3 failed sign-in attempts since your last
successful sign-in" (seeded).

### 2.1.13 Re-authenticate before critical operations

`POST /auth/reauth` exchanges the current password for a **five-minute** token
with `purpose: "reauth"`, sent back as `X-Reauth-Token`. The purpose claim is
checked on verification, so an ordinary session token cannot satisfy it —
without that, merely being signed in would satisfy the requirement and the
control would be decorative.

Operations flagged `reauth: true`:

| Operation | Why |
|---|---|
| `POST /auth/change-password` | named by the specification |
| `POST /admin/users` | creates a privileged account |
| `PATCH /admin/users/:id/role` | grants or removes administrator rights |
| `DELETE /admin/users/:id` | disables an account |
| `POST /admin/users/:id/unlock` · `/force-reset` | account recovery |
| `DELETE /posts/:postId/permanent` | irreversible destruction |
| `POST /refunds/issue` | moves money |

A failed re-auth counts toward lockout, so a stolen session cannot be used as an
unmetered password oracle.

---

## 2.2 Authorization / Access Control

### 2.2.1 A single site-wide component

Before: `authenticate, authorizeRoles("ngo")` repeated on ~25 routes across five
route files. After: one policy table and one middleware, mounted once. Route
files contain **no authorization code at all** — a visible before/after in
`git diff`.

```js
{ method: "PUT", path: "/posts/:postId", roles: ["ngo"], owner: owners.post },
{ method: "POST", path: "/refunds/issue", roles: ["ngo","admin"],
  owner: owners.refundablePayment, reauth: true, sensitive: true },
{ method: "GET", path: "/security-logs", roles: ["admin"], sensitive: true },
```

A startup self-check reports any registered route without a policy. Current
output:

```
✓ Access control: 55 routes registered, all covered by a policy.
```

### 2.2.2 Access controls fail securely

- **Default deny.** No matching policy → denied.
- An ownership resolver that throws is treated as a **denial**, never a pass.
- Account status and `tokenVersion` are re-read on every request, so disabling,
  locking, demoting, or a password change takes effect immediately rather than
  when the token happens to expire.
- Resources the caller does not own return **404, not 403** — a 403 confirms the
  row exists and turns any id into an enumeration oracle. The log still records
  the true reason as `ACCESS_DENIED_OWNERSHIP`.

**Vulnerabilities this closed.** Each was live in the original code: role-gated,
then never checked *whose* row was being touched.

| Endpoint | Was exploitable as |
|---|---|
| `PUT /posts/:postId` | any NGO could rewrite any other NGO's project |
| `DELETE /posts/:postId` | any NGO could delete any other NGO's project |
| `GET /posts/:postId` | any user could read drafts, unapproved and deleted projects |
| `POST /refunds/issue` | any NGO could refund any payment on any project |
| `GET /payments/:paymentId` | any user could read any payment record |
| `GET /payments/history/:postId` | any NGO could read another project's payments |
| `GET /refunds/:refundId`, `/history/:postId` | same, for refunds |
| `GET /documents/:postId`, `/download/:documentId` | any user could download any organization's documents |

The same file already checked ownership correctly in `uploadDocument` and
`deleteDocument` — two functions careful, two not, side by side. That
inconsistency is the clearest argument in the codebase for deciding
authorization in one place.

**Demo** — as Action Aid, attempt to edit a Red Cross project (404). As a donor,
`GET /security-logs` (403). As a donor, request another donor's payment (404).
Then open `/admin/security-logs` and watch all three appear live.

### 2.2.3 Application logic flows comply with business rules

`security/businessRules.js`.

**Post lifecycle** — a state machine with per-actor permissions. Previously any
enum value was written straight through. Two invariants are what the table
exists to protect, and both are asserted exhaustively by tests:

1. **An owner can never reach Approved.** Publishing your own fundraising
   campaign without review is the thing moderation exists to prevent.
2. **Deleted is terminal**, for everyone.

Within those limits ordinary moderation is permitted — an administrator may
approve, reject, reconsider a rejection, or send a published project back for
review. A state machine that blocks legitimate administrator actions adds no
security; it just breaks the product and invites someone to delete the check.

**Contributions** — only on Approved, unexpired projects with an Open support
option; an in-kind item must belong to *that* project. Most importantly,
**progress totals move only on confirmation**. Previously totals were
incremented the moment a row was created, even at status `Pending`, so any donor
could drive a fundraising bar to its goal without giving anything and without
the organization agreeing.

That change needs somewhere to confirm, or donor contributions would never
count: `PendingContributions` on the organization's project page
(`/contribution-detail/:id`) is the review queue. Confirming is one-way — the
server refuses to decide an already-decided contribution, so a double click
cannot double-count a donation.

**Payments** — `computeFees()` derives every charge from the project's own data.
The endpoint previously accepted `donationAmount`, `monetaryFee`,
`volunteerFee` and `inKindFee` from the request body and charged their sum, so
`{ donationAmount: 100000, monetaryFee: 1 }` bought a ₱100,000 donation for ₱1
of fees. The fee fields are now **absent from the schema**, so with `.strict()`
sending one is a 400 rather than being silently ignored.

`POST /payments/confirm` takes the project and the owner from the Stripe
PaymentIntent's own metadata and verifies `metadata.userId` matches the caller.
It previously trusted the body and checked neither, so one user could confirm
and claim another user's payment.

**Refunds** — only a succeeded, not-yet-refunded payment, only by the owning
organization or an admin, and only with re-authentication.

**Accounts** — the last remaining administrator cannot be demoted or disabled;
an administrator cannot act on their own account; the `role` field is never read
from a registration body.

---

## 2.3 Data Validation

### 2.3.1 Validation failures result in rejection; sanitizing is not used

One `validate(schema)` middleware; every schema is `.strict()`, so unknown keys
are **rejected, not stripped** — which is also mass-assignment defence, since
controllers previously spread `req.body` into Prisma writes.

This was a real behavioural change. The original code went out of its way to
*repair* bad input:

| Was (silently repaired) | Now |
|---|---|
| Malformed budget breakdown → hardcoded 80/10/10 default | 400 |
| Percentages not summing to 100 → silently rescaled | 400 |
| In-kind items failing a shape check → silently dropped from the array | 400 |
| `parseFloat` on anything → a number or `NaN` reaching the database | 400 |
| `JSON.parse(x \|\| "[]")` → threw inside the controller, surfaced as a 500 | 400 |
| Missing `orgName` → silently became `"First Last"` | 400 |

Controllers read `req.validated`, never `req.body` — so a controller reaching
for raw input is visible in review.

### 2.3.2 Data range validation

Amounts (> 0, ≤ ₱1,000,000, ≤ 2 decimal places) · fundraising goals
(₱100–₱10,000,000) · volunteer counts (integer 1–10,000) · quantities ·
percentages summing to exactly 100 · dates (`startDate ≤ endDate`, within
−1/+5 years) · strict `HH:MM` times · every enum against the Prisma definition ·
**every path id validated as a UUID** before it reaches Prisma — a malformed id
previously produced a 500 carrying the driver's own message.

### 2.3.3 Data length validation

Email ≤ 254 (RFC 5321) · names ≤ 100 · organization ≤ 200 · project name 3–200 ·
description ≤ 5,000 · bio ≤ 1,000 · password 12–64 · answers 4–100 · request
bodies capped at 100 kB explicitly.

**File uploads** (`middleware/uploadMiddleware.js`) — 50 MB → **10 MB**; the
stored filename is a generated UUID (it was previously built from
`file.originalname`, so `../../server.js` or `invoice.pdf.exe` was partly
attacker-controlled); the extension must match the declared MIME type; and the
file's **actual magic bytes** must match too, so an executable renamed `.pdf` is
rejected and deleted.

**Demo**

```bash
amount: -500                     # rejected
amount: 999999999                # above the ceiling
endDate before startDate         # rejected
causes: ["worldDomination"]      # not a valid enum
postId: "'; DROP TABLE Post; --" # not a UUID — never reaches Prisma
budget percentages summing to 87 # rejected, previously rescaled silently
a .exe renamed to .pdf           # magic-byte mismatch
```

---

## 2.4 Error Handling and Logging

### 2.4.1 No debugging or stack trace information

`middleware/errorHandler.js` is the only place an error becomes a response, and
the rule is inverted: only an `AppError` — deliberately constructed with a
user-facing message — has its text forwarded. Everything else becomes one fixed
sentence.

Removed: `res.status(500).json({ error: err.message })` in ~15 places, one of
which also returned the Prisma error code and `meta` object. Prisma errors are
mapped server-side to safe messages, because Prisma's own text names the model
and column that failed.

Also: `x-powered-by` disabled, helmet headers, and the two
`NODE_ENV === "development"` conditional leaks deleted outright rather than
relying on the variable being set correctly.

**Verified live.** With the database unreachable:

```
client  → { "error": { "message": "Something went wrong on our end. Please try again.",
                       "code": "INTERNAL_ERROR",
                       "errorId": "82ebadb3-c1ea-44b2-93ad-dbc36366a9fb" } }

server  → [82ebadb3-c1ea-44b2-93ad-dbc36366a9fb] PrismaClientInitializationError:
          Error querying the database: FATAL: (ENOTFOUND) tenant/user postgres.… not found
```

Same `errorId`; the driver message, the tenant name, and the stack never cross
the wire.

### 2.4.2 Generic error messages and custom error pages

One response envelope everywhere. On the frontend: an `ErrorBoundary` at the
root, custom 401/403/404/500 pages, and a catch-all route — an unknown URL
previously rendered a blank white page. `apiFetch` was rewritten; it used to
throw `"API Error: 500 Internal Server Error"` and pages showed that to users.

### 2.4.3 Logging supports success **and** failure of security events

`security/securityLog.js` defines the catalogue in **pairs** — a test asserts
both halves exist, so an edit cannot leave the requirement half-met:

`LOGIN_SUCCESS`/`_FAILURE` · `REGISTRATION_SUCCESS`/`_FAILURE` ·
`PASSWORD_CHANGE_SUCCESS`/`_FAILURE` · `PASSWORD_RESET_SUCCESS`/`_FAILURE` ·
`SECURITY_ANSWER_SUCCESS`/`_FAILURE` · `REAUTH_SUCCESS`/`_FAILURE` ·
`ACCOUNT_LOCKED`/`ACCOUNT_UNLOCKED` · `PAYMENT_CONFIRMED`/`PAYMENT_CONFIRM_REJECTED` ·
`REFUND_ISSUED`/`REFUND_REJECTED` · `CONTRIBUTION_CONFIRMED`/`CONTRIBUTION_DECLINED` ·
`ACCESS_GRANTED_SENSITIVE`/`ACCESS_DENIED_*`

Each entry records timestamp, event, outcome, severity, actor (account, email,
role), IP, user agent, method, route, target, message, and metadata.

**Never logged:** passwords, hashes, tokens, security answers, card data. The
`redact()` helper matches on key *name*, so a future developer who writes
`metadata: { newPassword }` gets it redacted automatically. A key that matches
is redacted **whole**, even if it holds a structure — recursing would mean
trusting every inner key name to be recognised, and one unanticipated name would
leak.

The log is **append-only**: no update or delete function exists in the service,
and no route exposes one.

### 2.4.4 Log access restricted to administrators

`GET /security-logs` (+ `/summary`, `/event-types`), `roles: ["admin"]`.
Read-only is structural: there is no non-GET policy for `/security-logs` in the
table — a test asserts this — so a write is denied by default, not by omission.

The UI is `/admin/security-logs`: a 24-hour summary strip, quick filters (failed
sign-ins, lockouts, access denials, validation failures, critical only), full
filtering by date/event/outcome/severity/account/IP/text, an expandable metadata
row, and CSV export of the current view. Severity is colour-coded so critical
rows are visible from the back of a room.

Reading the log is itself logged (`SECURITY_LOG_VIEWED`).

**Demo** — as a donor or NGO, open `/admin/security-logs` and call
`GET /security-logs`: 403 in both. Then sign in as the administrator and watch
**those very denials** at the top of the log.

### 2.4.5 Log all input validation failures

Inside `validate()`, so every endpoint is covered by construction. Records the
field path and the rule that failed — and **never the submitted value**, which
would put passwords and payment details into a table rendered on an admin page.

### 2.4.6 Log all authentication attempts, especially failures

Every path through `loginUser`: success, unknown account, wrong password, locked,
disabled. Plus logout, registration, password change/reset, security-answer
checks, and re-authentication. Failures record the reason and the running
attempt count.

### 2.4.7 Log all access control failures

Inside `enforceAccessControl` — one place, five distinct reasons, so an
administrator can tell an unauthenticated request from a wrong role from
someone else's data from a missing policy:

`ACCESS_DENIED_UNAUTHENTICATED` · `ACCESS_DENIED_ROLE` ·
`ACCESS_DENIED_OWNERSHIP` · `ACCESS_DENIED_NO_POLICY` ·
`ACCESS_DENIED_ACCOUNT_STATE` · `ACCESS_DENIED_REAUTH_REQUIRED`

---

## Beyond the checklist

| Item | Note |
|---|---|
| **Committed secrets removed** | `backend/.env` was tracked in git with a live `DATABASE_URL`, `JWT_SECRET` and `SMTP_PASS`. Untracked; **rotation and history purge are still required — see below** |
| Session revocation | `tokenVersion` in every JWT; logout, password change, role change and disable invalidate all tokens at once. Sign-out previously only cleared `localStorage`, leaving a copied token valid for 7 days |
| Session lifetime | 7 days → 30 minutes |
| Dependency vulnerabilities | 8 → **0** (`npm audit`). Included a multer DoS, a nodemailer SMTP-injection issue, and a body-parser limit bypass — all in active code paths |
| Security headers | helmet: CSP, `X-Frame-Options: DENY`, nosniff, HSTS in production |
| Rate limiting | Per-IP on authentication and reset endpoints |
| Weak seed passwords | `admin123`, `donor123`, `redcross123` and a dozen more removed from source; now from env or generated once |
| Runtime bugs fixed | `require("stripe")` inside an ES module (every refund threw `ReferenceError`); `select: { amount: true }` on a column dropped by an earlier migration |
| Frontend role trust | `RequireRole` read `localStorage.userRole`; replaced with `AuthContext` + `GET /auth/me` |

### Still required from the team

These need a human decision or a credential only you hold:

1. **Rotate every secret** that was in the committed `.env`: database password,
   `JWT_SECRET`, SMTP app password, Stripe key. Assume the old values are public.
2. **Purge the file from git history**:
   `git filter-repo --path backend/.env --invert-paths`, then force-push and have
   every teammate re-clone. Untracking it (done) stops future commits; it does
   not remove it from past ones.
3. **Run the migration** — `npm run db:deploy` — against your database. It has
   not been executed here (no database was reachable from this machine).

---

## Testing

```bash
cd backend && npm test      # 257 tests, no database or network required
```

| Suite | Covers |
|---|---|
| `passwordPolicy.test.mjs` | complexity, length, bcrypt cost, salting, legacy-hash upgrade, minimum age |
| `accessControl.test.mjs` | policy matching, default deny, role assignment, ownership coverage, reauth coverage, the public surface |
| `securityQuestions.test.mjs` | catalogue quality, exclusion of the rubric's bad example, answer normalisation |
| `businessRules.test.mjs` | state machine, contribution eligibility, server-side fees, refund and admin interlocks |
| `validation.test.mjs` | rejection-not-repair, range, length, unknown keys, multipart JSON |
| `securityLog.test.mjs` | redaction, bounded output, event-pair completeness |

---

## Demo checklist

One row per rubric item.

| # | Do this | Expect |
|---|---|---|
| 1.1.1–3 | Sign in as each of the three accounts | Three distinct dashboards |
| 2.1.1 | Sign out; visit `/admin` directly; `curl /posts` | Redirect; 401. `/posts/approved` still public |
| 2.1.2 | Blank `JWT_SECRET`, start the server | Refuses to boot, says why |
| 2.1.3 | `SELECT email, "passwordHash" FROM "UserAccount"` | `$2b$12$…`; same password → different hashes |
| 2.1.4 | Unknown email / wrong password / pending org with correct password | Identical response all three times |
| 2.1.5 | Register with `Password123!` | Rejected as a common base word |
| 2.1.6 | Try 8 characters, then 70 | Both rejected |
| 2.1.7 | Type in any password field | Dots; toggle defaults to hidden |
| 2.1.8 | Fail sign-in 5×, then use the correct password | Refused; `ACCOUNT_LOCKED` in the log; admin can unlock |
| 2.1.9 | Walk `/forgot-password` | Questions shown; 3 wrong answers kills the link; `answerHash` is bcrypt |
| 2.1.10 | Change password to a previous one | "used recently" |
| 2.1.11 | Change on `freshpw@`, then on `donor@` | Refused, then allowed |
| 2.1.12 | Sign in as `mary.angela@redcross.ph` | Banner: previous sign-in, last failure, "3 failed attempts since" |
| 2.1.13 | Open Change Password | Re-auth modal first; request without `X-Reauth-Token` is refused |
| 2.2.1 | `accessControl.js` beside `git diff` of the route files | One policy table; no auth code in routes; boot says 55/55 covered |
| 2.2.2 | NGO A edits NGO B's project; donor calls `/security-logs`; donor reads another's payment | All denied; all three appear in the log |
| 2.2.3 | Contribute to a Pending project; `Deleted → Approved`; send `monetaryFee: 1` | All rejected; fee recomputed server-side |
| 2.3.1 | Budget summing to 87; in-kind item with no name | 400 — previously repaired silently |
| 2.3.2 | `amount: -500`; bad enum; malformed UUID | 400, never a 500 |
| 2.3.3 | 300-char name; 20 MB file; `.exe` renamed `.pdf` | All rejected |
| 2.4.1 | Stop the database mid-request | Generic message + `errorId`; find the stack in the log by that id |
| 2.4.2 | Visit `/nope` | Custom 404, not a blank page |
| 2.4.3 | Filter `LOGIN_SUCCESS`, then `LOGIN_FAILURE` | Both present, for every event family |
| 2.4.4 | Donor opens `/admin/security-logs` | 403 — and the denial appears in the admin's log |
| 2.4.5 | Submit an invalid form, filter `INPUT_VALIDATION_FAILURE` | Field paths present; **no** submitted values |
| 2.4.6 | Filter the authentication family | Every attempt, with IP and timestamp |
| 2.4.7 | Filter `ACCESS_DENIED_*` | Every denial, tagged by reason |
