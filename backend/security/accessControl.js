/**
 * accessControl.js — THE single site-wide authorization component.
 *
 * CSSECDV 2.2.1, 2.2.2, 2.4.7, and the enforcement half of 2.1.1.
 *
 * ─── Why one component ──────────────────────────────────────────────────────
 *
 * Authorization used to be spread across five route files as a repeated
 * `authenticate, authorizeRoles("ngo")` pair on roughly twenty-five routes. It
 * mostly worked — which is the problem. `PUT /posts/:postId` carried the role
 * check and silently omitted the ownership check, so any NGO could rewrite any
 * other NGO's project. `POST /refunds/issue` had the same omission over money.
 * Meanwhile `uploadDocument` and `getPaymentsByDonor` *did* check ownership,
 * inline, in their own style.
 *
 * Nothing was obviously wrong in any one file. That is exactly the failure mode
 * a single component prevents: when the rule lives in twenty-five places, no
 * one can read the system's access policy, so no one notices the gap.
 *
 * ─── How it works ───────────────────────────────────────────────────────────
 *
 * POLICIES below is the complete, readable access policy for the application.
 * `enforceAccessControl` is mounted ONCE in server.js, ahead of every router.
 * Route files contain no authorization code at all.
 *
 * ─── Failing securely [2.2.2] ───────────────────────────────────────────────
 *
 *   · A request matching no policy is DENIED. Adding a route without declaring
 *     a policy makes it unreachable rather than unprotected — the mistake fails
 *     closed. A startup self-check reports any such route immediately.
 *   · An ownership resolver that throws is treated as a denial, never a pass.
 *   · Account state is re-read on every request, so disabling or locking an
 *     account takes effect at once rather than whenever its token expires.
 *   · Every denial is logged with its specific reason [2.4.7].
 */

import prisma from "../prisma/client.js";
import owners from "./owners.js";
import { bearerToken, reauthTokenFrom, verifyToken, PURPOSE } from "./tokens.js";
import { logSecurityEvent, EVENTS, OUTCOME, SEVERITY } from "./securityLog.js";
import { AppError, unauthorized, forbidden, notFound } from "../errors/AppError.js";

/* ═══════════════════════════════════════════════════════════════════════════
 * THE POLICY TABLE
 *
 *   public   no authentication at all. Every entry here is a deliberate,
 *            reviewable decision — this list IS the answer to 2.1.1's
 *            "except those specifically intended to be public".
 *   roles    which roles may call it. Omitted ⇒ any authenticated user.
 *   owner    object-level check from owners.js. [2.2.2]
 *   reauth   requires a fresh password re-entry. [2.1.13]
 *   deferred ownership runs after the router's body parser (multipart only).
 *   sensitive successful access is logged, not just denials. [2.4.3]
 * ═══════════════════════════════════════════════════════════════════════════ */

export const POLICIES = [
  // ── Public ────────────────────────────────────────────────────────────────
  { method: "GET", path: "/health", public: true },
  { method: "POST", path: "/login", public: true },
  { method: "POST", path: "/register", public: true },
  { method: "POST", path: "/organizations/register", public: true },
  { method: "POST", path: "/forgot-password", public: true },
  { method: "GET", path: "/verify-reset-token", public: true },
  { method: "POST", path: "/reset-password/verify-answers", public: true },
  { method: "POST", path: "/reset-password", public: true },
  // The question catalogue is needed to render the registration form.
  { method: "GET", path: "/auth/security-questions", public: true },
  // The donor-facing project feed. The only public *data* route, and it returns
  // approved posts only.
  { method: "GET", path: "/posts/approved", public: true },

  // ── Session ───────────────────────────────────────────────────────────────
  { method: "GET", path: "/auth/me" },
  { method: "POST", path: "/auth/logout" },
  { method: "POST", path: "/auth/reauth" },
  { method: "POST", path: "/auth/security-questions" },
  // Changing a password is the specification's named example of a critical
  // operation requiring re-authentication. [2.1.13]
  { method: "POST", path: "/auth/change-password", reauth: true, sensitive: true },

  // ── Posts ─────────────────────────────────────────────────────────────────
  { method: "POST", path: "/posts", roles: ["ngo"] },
  { method: "GET", path: "/posts", roles: ["ngo"] },
  { method: "GET", path: "/posts/admin/all", roles: ["admin"] },
  { method: "GET", path: "/posts/partnerships/me", roles: ["donor"] },
  { method: "GET", path: "/posts/partnerships/incoming", roles: ["ngo"] },
  { method: "GET", path: "/posts/:postId", owner: owners.postVisible },
  { method: "GET", path: "/posts/:postId/audit", roles: ["admin"] },
  { method: "GET", path: "/posts/:postId/contributions", roles: ["ngo", "admin"], owner: owners.post },
  { method: "PUT", path: "/posts/:postId", roles: ["ngo"], owner: owners.post },
  { method: "DELETE", path: "/posts/:postId", roles: ["ngo"], owner: owners.post },
  { method: "PATCH", path: "/posts/:postId/contribute", roles: ["donor", "ngo"] },
  { method: "PATCH", path: "/posts/:postId/status", roles: ["admin"], sensitive: true },
  {
    method: "PATCH",
    path: "/posts/contributions/:contributionId/status",
    roles: ["ngo", "admin"],
    owner: owners.contributionForOrg,
    sensitive: true,
  },
  // Irreversible: destroys the post and every contribution, payment, refund and
  // document that hangs off it.
  {
    method: "DELETE",
    path: "/posts/:postId/permanent",
    roles: ["admin"],
    owner: owners.post,
    reauth: true,
    sensitive: true,
  },

  // ── Organizations ─────────────────────────────────────────────────────────
  { method: "GET", path: "/organizations/pending", roles: ["admin"] },
  { method: "GET", path: "/organizations/:id/verification" },
  { method: "PATCH", path: "/organizations/:id/approve", roles: ["admin"], sensitive: true },
  { method: "PATCH", path: "/organizations/:id/reject", roles: ["admin"], sensitive: true },

  // ── Documents ─────────────────────────────────────────────────────────────
  // Ownership is deferred: the post id arrives in a multipart body that multer
  // has not parsed yet when this middleware runs. See enforceDeferredOwnership.
  {
    method: "POST",
    path: "/documents/upload",
    roles: ["ngo", "admin"],
    owner: owners.postFromBody,
    deferred: true,
  },
  { method: "GET", path: "/documents/download/:documentId", owner: owners.document },
  { method: "GET", path: "/documents/:postId", owner: owners.documentsForPost },
  { method: "DELETE", path: "/documents/:documentId", roles: ["ngo", "admin"], owner: owners.documentOwned },

  // ── Payments ──────────────────────────────────────────────────────────────
  { method: "POST", path: "/payments/intent", roles: ["donor", "ngo"] },
  { method: "POST", path: "/payments/confirm", roles: ["donor", "ngo"], sensitive: true },
  { method: "GET", path: "/payments/history/:postId", roles: ["ngo", "admin"], owner: owners.paymentsForPost },
  { method: "GET", path: "/payments/donor/:donorId", owner: owners.donorPayments },
  { method: "GET", path: "/payments/project/:projectId", roles: ["ngo", "admin"], owner: owners.paymentsForPost },
  { method: "GET", path: "/payments/:paymentId", owner: owners.payment },

  // ── Refunds ───────────────────────────────────────────────────────────────
  {
    method: "POST",
    path: "/refunds/issue",
    roles: ["ngo", "admin"],
    owner: owners.refundablePayment,
    reauth: true,
    sensitive: true,
  },
  { method: "GET", path: "/refunds/history/:postId", roles: ["ngo", "admin"], owner: owners.paymentsForPost },
  { method: "GET", path: "/refunds/:refundId", owner: owners.refund },

  // ── Administration ────────────────────────────────────────────────────────
  { method: "GET", path: "/admin/users", roles: ["admin"] },
  { method: "POST", path: "/admin/users", roles: ["admin"], reauth: true, sensitive: true },
  {
    method: "PATCH",
    path: "/admin/users/:id/role",
    roles: ["admin"],
    owner: owners.notSelfAccount,
    reauth: true,
    sensitive: true,
  },
  {
    method: "DELETE",
    path: "/admin/users/:id",
    roles: ["admin"],
    owner: owners.notSelfAccount,
    reauth: true,
    sensitive: true,
  },
  {
    method: "POST",
    path: "/admin/users/:id/unlock",
    roles: ["admin"],
    owner: owners.notSelfAccount,
    reauth: true,
    sensitive: true,
  },
  {
    method: "POST",
    path: "/admin/users/:id/force-reset",
    roles: ["admin"],
    owner: owners.notSelfAccount,
    reauth: true,
    sensitive: true,
  },

  // ── Security log [2.4.4] ──────────────────────────────────────────────────
  // Administrators only, and read-only: there is deliberately no POST, PATCH,
  // PUT or DELETE policy here, and no controller behind one.
  { method: "GET", path: "/security-logs", roles: ["admin"], sensitive: true },
  { method: "GET", path: "/security-logs/event-types", roles: ["admin"] },
  { method: "GET", path: "/security-logs/summary", roles: ["admin"] },
];

/* ═══════════════════════════════════════════════════════════════════════════
 * MATCHING
 * ═══════════════════════════════════════════════════════════════════════════ */

const compile = (policy) => {
  const segments = policy.path.split("/").filter(Boolean);
  return {
    ...policy,
    segments,
    // Used to break ties: "/posts/approved" must win over "/posts/:postId".
    // Scoring by static-segment count makes that independent of declaration
    // order, so a later edit cannot accidentally shadow a public route with a
    // parameterised one (or, far worse, the reverse).
    specificity: segments.filter((segment) => !segment.startsWith(":")).length,
  };
};

const COMPILED = POLICIES.map(compile);

const matchSegments = (policy, pathSegments) => {
  if (policy.segments.length !== pathSegments.length) return null;

  const params = {};
  for (let i = 0; i < policy.segments.length; i += 1) {
    const expected = policy.segments[i];
    const actual = pathSegments[i];
    if (expected.startsWith(":")) {
      params[expected.slice(1)] = actual;
    } else if (expected !== actual) {
      return null;
    }
  }
  return params;
};

/**
 * Resolve the policy governing a request. Returns null when none applies —
 * which the caller must treat as a denial.
 */
export const resolvePolicy = (method, path) => {
  const pathSegments = path
    .split("?")[0]
    .split("/")
    .filter(Boolean)
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment; // malformed escape — compare raw, it will simply not match
      }
    });

  let best = null;
  let bestParams = null;

  for (const policy of COMPILED) {
    if (policy.method !== method) continue;
    const params = matchSegments(policy, pathSegments);
    if (params === null) continue;
    if (best === null || policy.specificity > best.specificity) {
      best = policy;
      bestParams = params;
    }
  }

  return best ? { policy: best, params: bestParams } : null;
};

/* ═══════════════════════════════════════════════════════════════════════════
 * THE MIDDLEWARE
 * ═══════════════════════════════════════════════════════════════════════════ */

export const enforceAccessControl = async (req, res, next) => {
  const path = req.path;
  const method = req.method;

  // CORS preflight carries no credentials and is answered by the cors
  // middleware upstream; it never reaches a controller.
  if (method === "OPTIONS") return next();

  try {
    // ── 1. Find the governing policy. No policy ⇒ deny. [2.2.2] ─────────────
    const match = resolvePolicy(method, path);
    if (!match) {
      await logSecurityEvent(req, {
        eventType: EVENTS.ACCESS_DENIED_NO_POLICY,
        outcome: OUTCOME.FAILURE,
        severity: SEVERITY.WARN,
        message: `Denied by default: no access policy declared for ${method} ${path}.`,
      });
      return next(notFound());
    }

    const { policy, params } = match;
    req.matchedPolicy = policy;
    // The router has not dispatched yet, so req.params is still empty. Populate
    // it so ownership resolvers can read path parameters. Express reassigns the
    // same values during dispatch.
    req.params = { ...req.params, ...params };
    req.policyParams = params;

    // ── 2. Public routes ───────────────────────────────────────────────────
    if (policy.public) return next();

    // ── 3. Authenticate [2.1.1] ────────────────────────────────────────────
    const token = bearerToken(req);
    if (!token) {
      await logSecurityEvent(req, {
        eventType: EVENTS.ACCESS_DENIED_UNAUTHENTICATED,
        outcome: OUTCOME.FAILURE,
        severity: SEVERITY.INFO,
        message: `Unauthenticated request to a protected resource: ${method} ${path}.`,
      });
      return next(unauthorized());
    }

    const verified = verifyToken(token, PURPOSE.ACCESS);
    if (!verified.valid) {
      await logSecurityEvent(req, {
        eventType: EVENTS.AUTH_TOKEN_INVALID,
        outcome: OUTCOME.FAILURE,
        severity: verified.reason === "expired" ? SEVERITY.INFO : SEVERITY.WARN,
        message: `Session token rejected (${verified.reason}) for ${method} ${path}.`,
        metadata: { reason: verified.reason },
      });
      return next(unauthorized("Your session has expired. Please sign in again."));
    }

    // ── 4. Re-read the account. [2.1.2, 2.2.2] ─────────────────────────────
    // Read fresh on every request rather than trusting the token's claims: a
    // token issued before an account was locked, disabled, demoted, or had its
    // password changed must stop working immediately, not when it expires.
    const account = await prisma.userAccount.findUnique({
      where: { id: verified.payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        tokenVersion: true,
        lockedUntil: true,
        mustChangePassword: true,
      },
    });

    if (!account) {
      await logSecurityEvent(req, {
        eventType: EVENTS.AUTH_TOKEN_INVALID,
        outcome: OUTCOME.FAILURE,
        severity: SEVERITY.WARN,
        message: "Session token referenced an account that no longer exists.",
      });
      return next(unauthorized("Your session has expired. Please sign in again."));
    }

    // Revocation check.
    if (account.tokenVersion !== verified.payload.tv) {
      await logSecurityEvent(req, {
        eventType: EVENTS.AUTH_TOKEN_INVALID,
        outcome: OUTCOME.FAILURE,
        severity: SEVERITY.INFO,
        message: "Session token was revoked (password change, role change, or sign-out).",
        actorAccountId: account.id,
        actorEmail: account.email,
        actorRole: account.role,
      });
      return next(unauthorized("Your session has ended. Please sign in again."));
    }

    if (account.status !== "Active") {
      await logSecurityEvent(req, {
        eventType: EVENTS.ACCESS_DENIED_ACCOUNT_STATE,
        outcome: OUTCOME.FAILURE,
        severity: SEVERITY.WARN,
        message: `Request from an account in state "${account.status}".`,
        actorAccountId: account.id,
        actorEmail: account.email,
        actorRole: account.role,
        metadata: { status: account.status },
      });
      return next(forbidden("This account is not permitted to sign in."));
    }

    if (account.lockedUntil && account.lockedUntil > new Date()) {
      await logSecurityEvent(req, {
        eventType: EVENTS.ACCESS_DENIED_ACCOUNT_STATE,
        outcome: OUTCOME.FAILURE,
        severity: SEVERITY.WARN,
        message: "Request from a locked account.",
        actorAccountId: account.id,
        actorEmail: account.email,
        actorRole: account.role,
      });
      return next(forbidden("This account is temporarily locked."));
    }

    // Role is taken from the freshly-read account, not from the token, so a
    // demotion cannot be replayed with an old token.
    req.user = {
      accountId: account.id,
      id: verified.payload.pid, // profile id — Post.orgId, Donor.id, Admin.id
      role: account.role,
      email: account.email,
      mustChangePassword: account.mustChangePassword,
    };
    req.account = account;

    // ── 5. Role check [2.2.2] ──────────────────────────────────────────────
    if (Array.isArray(policy.roles) && !policy.roles.includes(account.role)) {
      await logSecurityEvent(req, {
        eventType: EVENTS.ACCESS_DENIED_ROLE,
        outcome: OUTCOME.FAILURE,
        severity: SEVERITY.WARN,
        message: `Role "${account.role}" attempted ${method} ${path}, which requires ${policy.roles.join(" or ")}.`,
        metadata: { requiredRoles: policy.roles, actualRole: account.role },
      });
      return next(forbidden());
    }

    // ── 6. Re-authentication [2.1.13] ──────────────────────────────────────
    if (policy.reauth) {
      const reauth = reauthTokenFrom(req);
      const checked = verifyToken(reauth, PURPOSE.REAUTH);
      const bound = checked.valid && checked.payload.sub === account.id;
      const current = checked.valid && checked.payload.tv === account.tokenVersion;

      if (!bound || !current) {
        await logSecurityEvent(req, {
          eventType: EVENTS.ACCESS_DENIED_REAUTH_REQUIRED,
          outcome: OUTCOME.FAILURE,
          severity: SEVERITY.WARN,
          message: `Critical operation ${method} ${path} attempted without a valid re-authentication.`,
          metadata: { reason: checked.valid ? "not_bound_to_account" : checked.reason },
        });
        // A distinct code so the frontend knows to open the re-auth prompt
        // rather than treating this as a flat permission failure.
        return next(
          new AppError("Please confirm your password to continue.", 403, "REAUTH_REQUIRED"),
        );
      }
    }

    // ── 7. Ownership [2.2.2] ───────────────────────────────────────────────
    if (typeof policy.owner === "function" && !policy.deferred) {
      const allowed = await runOwnershipCheck(req, policy);
      if (!allowed) return next(notFound());
    }

    // ── 8. Record successful access to sensitive routes [2.4.3] ────────────
    // Only sensitive routes: logging every successful read would bury the
    // failures an administrator actually needs to see.
    if (policy.sensitive) {
      await logSecurityEvent(req, {
        eventType: EVENTS.ACCESS_GRANTED_SENSITIVE,
        outcome: OUTCOME.SUCCESS,
        severity: SEVERITY.INFO,
        message: `Authorized ${method} ${path}.`,
      });
    }

    return next();
  } catch (error) {
    // Any unexpected failure inside the authorization path is a DENIAL. This is
    // the single most important line in the file: a database hiccup while
    // resolving ownership must never fall through to the controller. [2.2.2]
    await logSecurityEvent(req, {
      eventType: EVENTS.ACCESS_DENIED_NO_POLICY,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.CRITICAL,
      message: `Access control failed unexpectedly and denied the request: ${error.message}`,
      metadata: { errorName: error.name },
    });
    return next(forbidden());
  }
};

/**
 * Run a policy's ownership resolver, converting any exception into a denial.
 * Returns true only on an explicit, successful allow.
 */
const runOwnershipCheck = async (req, policy) => {
  let result;
  try {
    result = await policy.owner(req);
  } catch (error) {
    await logSecurityEvent(req, {
      eventType: EVENTS.ACCESS_DENIED_OWNERSHIP,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.CRITICAL,
      message: `Ownership check threw and was treated as a denial: ${error.message}`,
    });
    return false;
  }

  if (!result?.allowed) {
    await logSecurityEvent(req, {
      eventType: EVENTS.ACCESS_DENIED_OWNERSHIP,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.WARN,
      message: `${req.user?.role ?? "user"} attempted to access a resource belonging to someone else: ${req.method} ${req.path}.`,
      metadata: { params: req.policyParams },
    });
    return false;
  }

  // Hand the already-loaded row to the controller so it need not re-query.
  req.resource = result.resource;
  return true;
};

/**
 * Ownership enforcement for routes whose resource id arrives in a multipart
 * body, which multer only parses once the router dispatches.
 *
 * The policy is still declared in POLICIES — this only moves the moment of
 * execution, so the "single component" property holds. Mount it immediately
 * after the upload middleware on any route flagged `deferred: true`.
 */
export const enforceDeferredOwnership = async (req, res, next) => {
  const policy = req.matchedPolicy;
  if (!policy?.deferred || typeof policy.owner !== "function") return next();

  const allowed = await runOwnershipCheck(req, policy);
  if (!allowed) return next(notFound());
  return next();
};

/* ═══════════════════════════════════════════════════════════════════════════
 * STARTUP SELF-CHECK
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Report any registered route with no entry in the policy table.
 *
 * Such a route is already safe — it is denied by default — but it is also
 * broken, and the failure would otherwise only surface when a user hit it. This
 * turns "you forgot a policy" into a message at boot rather than a bug report.
 *
 * The mount table is passed in rather than recovered from Express's internals.
 * Express 5 removed `layer.regexp` and replaced it with an opaque matcher
 * function, so there is no supported way to read a sub-router's mount path back
 * out. Since server.js already has that mapping, it hands it over — which makes
 * the check independent of Express's internal shape rather than hostage to it.
 *
 * @param {Array<{prefix: string, router: object}>} mounts
 * @param {Array<{method: string, path: string}>} [directRoutes] routes on the
 *        app itself rather than on a sub-router
 */
export const auditRoutePolicies = (mounts, directRoutes = []) => {
  try {
    const registered = [...directRoutes];

    const joinPath = (prefix, routePath) => {
      const combined = `${prefix === "/" ? "" : prefix}${routePath}`;
      // "/posts/" and "/posts" are the same route to the matcher.
      return combined.replace(/\/+$/, "") || "/";
    };

    for (const { prefix, router } of mounts) {
      for (const layer of router?.stack ?? []) {
        if (!layer.route) continue;
        const methods = layer.route.methods ?? {};
        for (const [method, enabled] of Object.entries(methods)) {
          if (enabled && method !== "_all") {
            registered.push({
              method: method.toUpperCase(),
              path: joinPath(prefix, layer.route.path ?? ""),
            });
          }
        }
      }
    }

    const unprotected = registered.filter(
      ({ method, path }) => resolvePolicy(method, path) === null,
    );

    if (unprotected.length > 0) {
      console.warn(
        "\n  ⚠ Routes with no entry in the access-control policy table.\n" +
          "    They are denied by default (fail-closed) and will return 404 until\n" +
          "    a policy is declared in backend/security/accessControl.js:\n" +
          unprotected.map(({ method, path }) => `      ${method} ${path}`).join("\n") +
          "\n",
      );
    } else {
      console.log(
        `  ✓ Access control: ${registered.length} routes registered, all covered by a policy.`,
      );
    }

    return unprotected;
  } catch (error) {
    console.warn(`  ⚠ Could not audit route policies: ${error.message}`);
    return [];
  }
};

export default enforceAccessControl;
