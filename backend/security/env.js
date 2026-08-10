/**
 * env.js — validated configuration, resolved once at boot.
 *
 * CSSECDV 2.1.2 (authentication controls fail securely):
 * If JWT_SECRET is absent, `jwt.sign(payload, undefined)` throws but
 * `jwt.verify(token, undefined)` behaves unpredictably across versions — and a
 * weak or placeholder secret lets anyone mint an `admin` token. Rather than
 * discovering that at request time, we refuse to start the process at all.
 * A server that will not boot cannot be exploited.
 */

import dotenv from "dotenv";

/**
 * Loaded HERE rather than in server.js.
 *
 * ES module imports are hoisted and fully evaluated before any statement in the
 * importing module runs. A `dotenv.config()` call at the top of server.js
 * therefore executes AFTER this file has already read process.env — so every
 * variable looked empty and the server refused to start with a perfectly valid
 * .env on disk. Configuration must load itself.
 */
dotenv.config();

const REQUIRED = ["DATABASE_URL", "JWT_SECRET"];

/** Values a developer might leave in place from a template. */
const PLACEHOLDER_SECRETS = new Set([
  "",
  "secret",
  "changeme",
  "your-secret-here",
  "jwt_secret",
  "supersecret",
  "mysecretkey",
  "development",
  "test",
]);

const MIN_SECRET_LENGTH = 32;

const fail = (messages) => {
  console.error("\n" + "=".repeat(72));
  console.error(" STARTUP ABORTED — insecure or incomplete configuration");
  console.error("=".repeat(72));
  for (const message of messages) console.error("  ✗ " + message);
  console.error("\n  See backend/.env.example for the full list of variables.");
  console.error("  Generate a signing key with:");
  console.error(
    '    node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64\'))"',
  );
  console.error("=".repeat(72) + "\n");
  process.exit(1);
};

const readInt = (name, fallback) => {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    fail([`${name} must be a positive integer (received "${raw}").`]);
  }
  return parsed;
};

const problems = [];

for (const name of REQUIRED) {
  if (!process.env[name]?.trim()) {
    problems.push(`${name} is required but not set.`);
  }
}

const jwtSecret = process.env.JWT_SECRET?.trim() ?? "";
if (jwtSecret) {
  if (jwtSecret.length < MIN_SECRET_LENGTH) {
    problems.push(
      `JWT_SECRET is only ${jwtSecret.length} characters. At least ${MIN_SECRET_LENGTH} are required.`,
    );
  }
  if (PLACEHOLDER_SECRETS.has(jwtSecret.toLowerCase())) {
    problems.push("JWT_SECRET is a well-known placeholder value. Generate a real one.");
  }
}

const nodeEnv = process.env.NODE_ENV ?? "development";
const isProduction = nodeEnv === "production";

if (isProduction && !process.env.FRONTEND_URL?.trim()) {
  problems.push(
    "FRONTEND_URL must be set in production so CORS is restricted to a known origin.",
  );
}

if (problems.length > 0) fail(problems);

/**
 * Warnings are surfaced but do not block boot — these degrade a feature rather
 * than weaken an access-control decision.
 */
const warnings = [];
if (!process.env.SMTP_HOST?.trim()) {
  warnings.push("SMTP_HOST is not set — password reset emails will fail to send.");
}
if (!process.env.STRIPE_SECRET_KEY?.trim()) {
  warnings.push("STRIPE_SECRET_KEY is not set — payment and refund endpoints will fail.");
}
if (!isProduction) {
  warnings.push(
    `NODE_ENV is "${nodeEnv}". Run the demo with NODE_ENV=production so error responses are fully generic.`,
  );
}
for (const warning of warnings) console.warn("  ⚠ " + warning);

export const config = {
  nodeEnv,
  isProduction,
  port: readInt("PORT", 3000),

  jwtSecret,
  /** Session token lifetime. Short, because there is no other revocation window. */
  accessTokenTtlMinutes: readInt("ACCESS_TOKEN_TTL_MINUTES", 30),
  /** Re-authentication token lifetime for critical operations. [2.1.13] */
  reauthTokenTtlMinutes: readInt("REAUTH_TOKEN_TTL_MINUTES", 5),

  // ── Account lockout [2.1.8] ────────────────────────────────────────────────
  // 5 attempts per 15 minutes caps an attacker at 480 guesses/day/account,
  // which is hopeless against the 12-character policy in passwordPolicy.js,
  // while a locked-out legitimate user waits at most one coffee break. A longer
  // window would turn lockout itself into a denial-of-service vector.
  lockoutThreshold: readInt("LOCKOUT_THRESHOLD", 5),
  lockoutDurationMinutes: readInt("LOCKOUT_DURATION_MINUTES", 15),

  // ── Password lifecycle [2.1.10, 2.1.11] ───────────────────────────────────
  passwordMinAgeHours: readInt("PASSWORD_MIN_AGE_HOURS", 24),
  passwordHistoryDepth: readInt("PASSWORD_HISTORY_DEPTH", 5),

  // ── Security questions [2.1.9] ────────────────────────────────────────────
  securityQuestionCount: readInt("SECURITY_QUESTION_COUNT", 2),
  securityAnswerMaxAttempts: readInt("SECURITY_ANSWER_MAX_ATTEMPTS", 3),

  // ── Uploads [2.3.3] ───────────────────────────────────────────────────────
  maxUploadBytes: readInt("MAX_UPLOAD_BYTES", 10 * 1024 * 1024),

  /** Browser origins permitted to call this API. */
  allowedOrigins: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    ...(process.env.FRONTEND_URL?.split(",").map((o) => o.trim()) ?? []),
  ].filter(Boolean),
};

export default config;
