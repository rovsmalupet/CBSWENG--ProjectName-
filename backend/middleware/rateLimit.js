/**
 * rateLimit.js — per-IP request limits on the authentication surface.
 *
 * Complements per-account lockout [CSSECDV 2.1.8] rather than duplicating it.
 * The two defend against different attacks:
 *
 *   lockout      many guesses against ONE account  → locks that account
 *   rate limit   one guess against MANY accounts   → password spraying, which
 *                lockout cannot see because no single account ever reaches its
 *                threshold
 *
 * A rate limit also reduces the denial-of-service potential of lockout itself:
 * an attacker who wants to lock out an entire user base has to get through this
 * first.
 */

import rateLimit from "express-rate-limit";
import { logSecurityEvent, EVENTS, OUTCOME, SEVERITY } from "../security/securityLog.js";

const limitReached = (label, eventType = EVENTS.RATE_LIMITED) => async (req, res, next, options) => {
  await logSecurityEvent(req, {
    eventType,
    outcome: OUTCOME.FAILURE,
    severity: SEVERITY.CRITICAL,
    message: `Rate limit reached on ${label} from this address — possible automated attack.`,
    metadata: { limit: options.max, windowMs: options.windowMs },
  });

  res.status(options.statusCode).json({
    error: {
      message: "Too many attempts from this location. Please wait a few minutes and try again.",
      code: "RATE_LIMITED",
    },
  });
};

/** Sign-in, registration, and re-authentication. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitReached("authentication", EVENTS.LOGIN_FAILURE),
});

/**
 * Password reset. Tighter, because each request sends an email — an unlimited
 * endpoint here is both an enumeration oracle and a way to use our mail server
 * to flood someone else's inbox.
 */
export const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitReached("password reset"),
});

/** A broad ceiling for everything else, high enough not to affect normal use. */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limitReached("the API"),
});

export default { authLimiter, resetLimiter, generalLimiter };
