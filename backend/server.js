/**
 * server.js — application wiring.
 *
 * Middleware order below is a security decision, not a convention. Read the
 * numbered comments top to bottom: each layer assumes the ones above it have
 * already run.
 */

// Imported first, before anything that reads configuration. This module loads
// .env and validates it, aborting the process if the JWT signing key is
// missing, too short, or a known placeholder. A server that cannot verify
// tokens correctly must not start. [CSSECDV 2.1.2]
import config from "./security/env.js";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import { enforceAccessControl, auditRoutePolicies } from "./security/accessControl.js";
import { generalLimiter } from "./middleware/rateLimit.js";
import { handleUploadErrors } from "./middleware/uploadMiddleware.js";
import {
  errorHandler,
  notFoundHandler,
  installProcessHandlers,
} from "./middleware/errorHandler.js";
import { seedDefaultUsers } from "./services/userAccountService.js";

import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import refundRoutes from "./routes/refundRoutes.js";
import adminUserRoutes from "./routes/adminUserRoutes.js";
import securityLogRoutes from "./routes/securityLogRoutes.js";

installProcessHandlers();

const app = express();

/* ── 1. Response headers ──────────────────────────────────────────────────── */

// Removes X-Powered-By and sets the standard defensive headers: a restrictive
// Content-Security-Policy, X-Frame-Options: DENY against clickjacking,
// X-Content-Type-Options: nosniff so an uploaded file cannot be re-interpreted
// as script, plus HSTS in production.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // This is a JSON API; it never returns markup that executes.
        scriptSrc: ["'none'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'self'"],
      },
    },
    crossOriginResourcePolicy: { policy: "same-site" },
  }),
);
app.disable("x-powered-by");

/**
 * Trust exactly one proxy hop in production (Render/Vercel sit in front).
 *
 * This governs whether req.ip believes X-Forwarded-For. Trusting it blindly
 * would let anyone forge the source address of their own failed logins and
 * poison the security log; not trusting it behind a real proxy would record
 * every request as coming from the load balancer.
 */
app.set("trust proxy", config.isProduction ? 1 : false);

/* ── 2. CORS ──────────────────────────────────────────────────────────────── */

app.use(
  cors({
    origin: (origin, callback) => {
      // No Origin header: same-origin, curl, or a server-to-server call. The
      // access-control layer still requires a valid token, so allowing these
      // does not grant anything.
      if (!origin) return callback(null, true);
      if (config.allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false); // reject quietly, never echo the origin back
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Reauth-Token"],
    exposedHeaders: ["X-Reauth-Token"],
  }),
);

/* ── 3. Body parsing, with explicit limits [2.3.3] ────────────────────────── */

// Stated rather than defaulted. An unbounded parser is a cheap denial of
// service, and the limit belongs where a reader will find it.
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb", parameterLimit: 50 }));

/* ── 4. Rate limiting ─────────────────────────────────────────────────────── */

// Broad ceiling; the authentication endpoints add far tighter limits of their
// own inside their route files.
app.use(generalLimiter);

/* ── 5. Access control — mounted ONCE, ahead of every router [2.2.1] ──────── */

/**
 * This single line replaces the `authenticate, authorizeRoles(...)` pairs that
 * used to be repeated across roughly twenty-five routes in five files.
 *
 * It runs BEFORE the routers, so a request that fails authorization never
 * reaches a controller — and a route with no declared policy is denied by
 * default rather than served unprotected. [2.2.2]
 */
app.use(enforceAccessControl);

/* ── 6. Routes ────────────────────────────────────────────────────────────── */

app.get("/health", (req, res) => {
  // Deliberately minimal. A health check that reports the version, database
  // status, or environment is free reconnaissance.
  res.status(200).json({ status: "OK" });
});

/**
 * The mount table, declared once and used twice: to mount the routers, and to
 * audit them against the policy table at startup. Keeping it in one place means
 * the audit cannot drift out of step with what is actually served.
 */
const MOUNTS = [
  { prefix: "/", router: authRoutes },
  { prefix: "/posts", router: postRoutes },
  { prefix: "/organizations", router: organizationRoutes },
  { prefix: "/documents", router: documentRoutes },
  { prefix: "/payments", router: paymentRoutes },
  { prefix: "/refunds", router: refundRoutes },
  { prefix: "/admin", router: adminUserRoutes },
  { prefix: "/security-logs", router: securityLogRoutes },
];

for (const { prefix, router } of MOUNTS) {
  app.use(prefix, router);
}

/* ── 7. Error handling [2.4.1, 2.4.2] ─────────────────────────────────────── */

app.use(handleUploadErrors); // multer's own errors → generic AppErrors
app.use(notFoundHandler);
app.use(errorHandler); // must be last: Express identifies it by arity

/* ── 8. Start ─────────────────────────────────────────────────────────────── */

app.listen(config.port, async () => {
  console.log(`\n  BayaniHub API listening on port ${config.port} (${config.nodeEnv})`);

  // Reports any registered route with no entry in the policy table. Such a
  // route is already safe — it fails closed — but it is also broken, and this
  // turns "someone forgot a policy" into a message at boot rather than a bug
  // report from a user. [2.2.1]
  auditRoutePolicies(MOUNTS, [{ method: "GET", path: "/health" }]);

  try {
    await seedDefaultUsers();
  } catch (error) {
    console.error("  ⚠ Could not seed the bootstrap administrator:", error.message);
  }

  console.log("");
});

export default app;
