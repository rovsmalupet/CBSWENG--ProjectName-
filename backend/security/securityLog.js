/**
 * securityLog.js — the append-only security event log.
 *
 * CSSECDV 2.4.3 – 2.4.7.
 *
 * Three properties this module guarantees:
 *
 *  1. APPEND-ONLY. There is no update or delete function here, and no route
 *     exposes one. Administrators get read access only [2.4.4]; an attacker who
 *     reaches an admin session still cannot erase their tracks.
 *
 *  2. NEVER BREAKS A REQUEST. Every write is wrapped: if the log table is
 *     unreachable we fall back to stderr rather than turning a failed login into
 *     a 500. Logging is an observer, never a gatekeeper.
 *
 *  3. NEVER STORES SECRETS. Metadata passes through redact() first. A log that
 *     captures the password from a failed login attempt is worse than no log —
 *     it turns a read-only admin page into a credential dump.
 */

import prisma from "../prisma/client.js";

/* ═══════════════════════════════════════════════════════════════════════════
 * EVENT CATALOGUE
 *
 * Requirement 2.4.3 is that logging supports "both success and failure of
 * specified security events" — so the families below are written in pairs. If
 * you add an event, add its counterpart.
 * ═══════════════════════════════════════════════════════════════════════════ */
export const EVENTS = Object.freeze({
  // ── Authentication [2.4.6] ───────────────────────────────────────────────
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  ACCOUNT_UNLOCKED: "ACCOUNT_UNLOCKED",
  REGISTRATION_SUCCESS: "REGISTRATION_SUCCESS",
  REGISTRATION_FAILURE: "REGISTRATION_FAILURE",

  // ── Password lifecycle ───────────────────────────────────────────────────
  PASSWORD_CHANGE_SUCCESS: "PASSWORD_CHANGE_SUCCESS",
  PASSWORD_CHANGE_FAILURE: "PASSWORD_CHANGE_FAILURE",
  PASSWORD_RESET_REQUESTED: "PASSWORD_RESET_REQUESTED",
  PASSWORD_RESET_SUCCESS: "PASSWORD_RESET_SUCCESS",
  PASSWORD_RESET_FAILURE: "PASSWORD_RESET_FAILURE",
  PASSWORD_REUSE_REJECTED: "PASSWORD_REUSE_REJECTED", // [2.1.10]
  PASSWORD_MIN_AGE_REJECTED: "PASSWORD_MIN_AGE_REJECTED", // [2.1.11]
  SECURITY_ANSWER_SUCCESS: "SECURITY_ANSWER_SUCCESS", // [2.1.9]
  SECURITY_ANSWER_FAILURE: "SECURITY_ANSWER_FAILURE",
  SECURITY_QUESTIONS_SET: "SECURITY_QUESTIONS_SET",

  // ── Re-authentication [2.1.13] ───────────────────────────────────────────
  REAUTH_SUCCESS: "REAUTH_SUCCESS",
  REAUTH_FAILURE: "REAUTH_FAILURE",

  // ── Authorization [2.4.7] ────────────────────────────────────────────────
  ACCESS_GRANTED_SENSITIVE: "ACCESS_GRANTED_SENSITIVE",
  ACCESS_DENIED_NO_POLICY: "ACCESS_DENIED_NO_POLICY",
  ACCESS_DENIED_UNAUTHENTICATED: "ACCESS_DENIED_UNAUTHENTICATED",
  ACCESS_DENIED_ROLE: "ACCESS_DENIED_ROLE",
  ACCESS_DENIED_OWNERSHIP: "ACCESS_DENIED_OWNERSHIP",
  ACCESS_DENIED_ACCOUNT_STATE: "ACCESS_DENIED_ACCOUNT_STATE",
  ACCESS_DENIED_REAUTH_REQUIRED: "ACCESS_DENIED_REAUTH_REQUIRED",
  AUTH_TOKEN_INVALID: "AUTH_TOKEN_INVALID",

  // ── Validation [2.4.5] ───────────────────────────────────────────────────
  INPUT_VALIDATION_FAILURE: "INPUT_VALIDATION_FAILURE",
  RATE_LIMITED: "RATE_LIMITED",

  // ── Administrative actions ───────────────────────────────────────────────
  USER_CREATED: "USER_CREATED",
  USER_DELETED: "USER_DELETED",
  USER_ROLE_CHANGED: "USER_ROLE_CHANGED",
  ACCOUNT_APPROVED: "ACCOUNT_APPROVED",
  ACCOUNT_REJECTED: "ACCOUNT_REJECTED",
  POST_STATUS_CHANGED: "POST_STATUS_CHANGED",
  SECURITY_LOG_VIEWED: "SECURITY_LOG_VIEWED", // who reads the log is itself an event

  // ── Business / financial [2.2.3] ─────────────────────────────────────────
  PAYMENT_INTENT_CREATED: "PAYMENT_INTENT_CREATED",
  PAYMENT_CONFIRMED: "PAYMENT_CONFIRMED",
  PAYMENT_CONFIRM_REJECTED: "PAYMENT_CONFIRM_REJECTED",
  REFUND_ISSUED: "REFUND_ISSUED",
  REFUND_REJECTED: "REFUND_REJECTED",
  CONTRIBUTION_CREATED: "CONTRIBUTION_CREATED",
  CONTRIBUTION_CONFIRMED: "CONTRIBUTION_CONFIRMED",
  CONTRIBUTION_DECLINED: "CONTRIBUTION_DECLINED",
  BUSINESS_RULE_VIOLATION: "BUSINESS_RULE_VIOLATION",
  DOCUMENT_UPLOADED: "DOCUMENT_UPLOADED",
  DOCUMENT_DELETED: "DOCUMENT_DELETED",
  BOOKMARK_CREATED: "BOOKMARK_CREATED",
  BOOKMARK_UPDATED: "BOOKMARK_UPDATED",
  BOOKMARK_DELETED: "BOOKMARK_DELETED",

  // ── Errors [2.4.1] ───────────────────────────────────────────────────────
  UNHANDLED_ERROR: "UNHANDLED_ERROR",
});

export const OUTCOME = Object.freeze({ SUCCESS: "SUCCESS", FAILURE: "FAILURE" });
export const SEVERITY = Object.freeze({ INFO: "INFO", WARN: "WARN", CRITICAL: "CRITICAL" });

/* ═══════════════════════════════════════════════════════════════════════════
 * REDACTION
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Any key whose name matches one of these never reaches the database. */
const SENSITIVE_KEY_PATTERN =
  /pass|secret|token|answer|authorization|cookie|session|apikey|api_key|creditcard|card|cvv|clientsecret|client_secret/i;

const MAX_STRING_LENGTH = 500;
const MAX_DEPTH = 4;

/**
 * Metadata is structurally redacted, while an event message is free text. Give
 * that second channel its own final safety net so an unexpected third-party
 * exception cannot persist a password, token, cookie, or bearer credential.
 */
export const sanitizeLogMessage = (value) =>
  String(value ?? "")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [REDACTED]")
    .replace(/\b[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, "[REDACTED_TOKEN]")
    .replace(
      /\b(password|passphrase|secret|token|answer|authorization|cookie|cvv)\b\s*[:=]\s*[^\s,;]+/gi,
      "$1=[REDACTED]",
    )
    .slice(0, 1000);

/**
 * Strips secrets out of a metadata object before it is written.
 *
 * Deliberately key-name based rather than a fixed allowlist: a future developer
 * who adds `metadata: { newPassword }` gets it redacted automatically instead of
 * discovering the leak in a code review that may never happen.
 */
export const redact = (value, depth = 0) => {
  if (value === null || value === undefined) return value;
  if (depth > MAX_DEPTH) return "[truncated: too deep]";

  if (typeof value === "string") {
    const sanitized = sanitizeLogMessage(value);
    return sanitized.length > MAX_STRING_LENGTH
      ? sanitized.slice(0, MAX_STRING_LENGTH) + "…[truncated]"
      : sanitized;
  }
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Date) return value.toISOString();

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => redact(item, depth + 1));
  }

  if (typeof value === "object") {
    const output = {};
    for (const [key, nested] of Object.entries(value)) {
      output[key] = SENSITIVE_KEY_PATTERN.test(key) ? "[REDACTED]" : redact(nested, depth + 1);
    }
    return output;
  }

  return String(value);
};

/* ═══════════════════════════════════════════════════════════════════════════
 * REQUEST CONTEXT
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Best-effort client IP.
 *
 * Only trusts X-Forwarded-For when Express has been told to trust the proxy
 * (`app.set("trust proxy", …)` in server.js). Otherwise the header is
 * attacker-controlled and would let someone forge the source of their own
 * failed logins — poisoning the very log an administrator relies on.
 */
export const clientIp = (req) => {
  if (!req) return null;
  const ip = req.ip || req.socket?.remoteAddress || null;
  return ip ? String(ip).replace(/^::ffff:/, "").slice(0, 45) : null;
};

const userAgent = (req) => {
  const raw = req?.headers?.["user-agent"];
  return raw ? String(raw).slice(0, 255) : null;
};

/**
 * The route pattern rather than the concrete URL, so ids do not end up in a
 * column that gets rendered into an admin page, and so events group cleanly
 * when filtering. The concrete id belongs in targetId.
 */
const routeOf = (req) => {
  if (!req) return null;
  const base = req.route?.path ?? req.originalUrl?.split("?")[0] ?? req.url;
  return base ? String(base).slice(0, 255) : null;
};

/* ═══════════════════════════════════════════════════════════════════════════
 * WRITE
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Record a security event. Never throws, never rejects.
 *
 * @param {import('express').Request|null} req
 * @param {object} event
 * @param {string} event.eventType  one of EVENTS
 * @param {string} event.outcome    SUCCESS | FAILURE
 * @param {string} [event.severity] INFO | WARN | CRITICAL
 * @param {string} event.message    human-readable, safe for an admin screen
 * @param {string} [event.actorEmail] for failures where no account resolves
 * @param {string} [event.actorAccountId]
 * @param {string} [event.actorRole]
 * @param {string} [event.targetType]
 * @param {string} [event.targetId]
 * @param {object} [event.metadata] redacted before write
 */
export const logSecurityEvent = async (req, event) => {
  try {
    const {
      eventType,
      outcome,
      severity = OUTCOME.FAILURE === outcome ? SEVERITY.WARN : SEVERITY.INFO,
      message,
      actorEmail,
      actorAccountId,
      actorRole,
      targetType,
      targetId,
      metadata,
    } = event;

    // req.user is populated by the access-control layer; fall back to it so
    // most call sites do not have to pass the actor explicitly.
    const resolvedAccountId = actorAccountId ?? req?.user?.accountId ?? null;
    const resolvedRole = actorRole ?? req?.user?.role ?? null;
    const resolvedEmail = actorEmail ?? req?.user?.email ?? null;

    await prisma.securityLog.create({
      data: {
        eventType,
        outcome,
        severity,
        message: sanitizeLogMessage(message),
        actorAccountId: resolvedAccountId,
        actorEmail: resolvedEmail ? String(resolvedEmail).toLowerCase().slice(0, 254) : null,
        actorRole: resolvedRole,
        ipAddress: clientIp(req),
        userAgent: userAgent(req),
        httpMethod: req?.method ?? null,
        route: routeOf(req),
        targetType: targetType ?? null,
        targetId: targetId ? String(targetId).slice(0, 100) : null,
        metadata: metadata === undefined ? undefined : redact(metadata),
      },
    });
  } catch (error) {
    // The log is an observer. If it cannot write, the request still completes —
    // but we make the failure loud on the server console so it is not silent.
    console.error(
      `[securityLog] FAILED TO WRITE ${event?.eventType ?? "unknown"}: ${error.message}`,
    );
  }
};

/**
 * Fire-and-forget wrapper for call sites inside synchronous control flow.
 * Explicitly swallows rejection so an unawaited promise cannot become an
 * unhandledRejection and take the process down.
 */
export const logSecurityEventSync = (req, event) => {
  void logSecurityEvent(req, event).catch(() => {});
};

export default logSecurityEvent;
