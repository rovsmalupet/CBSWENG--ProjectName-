/**
 * validate.js — one middleware, every endpoint. [CSSECDV 2.3.1, 2.3.2, 2.3.3, 2.4.5]
 *
 * ─── Reject, never sanitize [2.3.1] ─────────────────────────────────────────
 *
 * The requirement is explicit: "All validation failures should result in input
 * rejection. Sanitizing should not be used."
 *
 * That is a genuine change of behaviour here, not a formality. The previous
 * code went out of its way to *repair* bad input — a malformed budget
 * breakdown silently became a hardcoded default, in-kind items that failed a
 * shape check were quietly dropped from the array, percentages that did not sum
 * to 100 were rescaled, and `parseFloat` turned anything at all into a number
 * or NaN. Every one of those paths meant the data stored was not the data
 * submitted, and nobody was told. Now they are 400s.
 *
 * ─── Unknown keys are rejected, not stripped ────────────────────────────────
 *
 * Every schema is `.strict()`. Beyond compliance, this is mass-assignment
 * defence: controllers previously spread `req.body` into Prisma writes, so an
 * extra field in the JSON could reach a column the endpoint never intended to
 * expose. Rejecting the request is louder and safer than silently discarding.
 *
 * ─── Logging [2.4.5] ────────────────────────────────────────────────────────
 *
 * Every failure is logged with the field path and the rule that failed — and
 * never the submitted value. Logging rejected values would put passwords,
 * security answers, and payment details into a table rendered on an admin
 * screen, turning the audit log into a credential dump.
 */

import crypto from "crypto";

import { logSecurityEvent, EVENTS, OUTCOME, SEVERITY } from "../security/securityLog.js";
import { removeUploadedFile } from "./uploadMiddleware.js";

const isLoginAttempt = (req) =>
  req.method === "POST" && req.originalUrl?.split("?")[0] === "/login";

/**
 * @param {import('zod').ZodType} schema  validates { body, params, query }
 * @returns {import('express').RequestHandler}
 */
export const validate = (schema) => async (req, res, next) => {
  const result = schema.safeParse({
    body: req.body ?? {},
    params: req.params ?? {},
    query: req.query ?? {},
  });

  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      // "body.amount" rather than just "amount", so an administrator reading
      // the log can tell a bad path parameter from a bad body field.
      path: issue.path.join(".") || "(root)",
      rule: issue.code,
    }));

    await removeUploadedFile(req.file);

    await logSecurityEvent(req, {
      eventType: EVENTS.INPUT_VALIDATION_FAILURE,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.WARN,
      message: `Input rejected for ${req.method} ${req.originalUrl?.split("?")[0]}: ${issues
        .map((issue) => `${issue.path} (${issue.rule})`)
        .join(", ")}`,
      metadata: { issueCount: issues.length, issues },
    });

    // A malformed sign-in request is still an authentication attempt. Record
    // it in both required audit categories and return the same public status,
    // message, and code as every other failed login. Do not expose which field
    // failed, because that would create a response-shape oracle. [2.1.4, 2.4.6]
    if (isLoginAttempt(req)) {
      await logSecurityEvent(req, {
        eventType: EVENTS.LOGIN_FAILURE,
        outcome: OUTCOME.FAILURE,
        severity: SEVERITY.WARN,
        message: "Failed sign-in attempt: request validation failed.",
        metadata: { issueCount: issues.length, issues },
      });

      return res.status(401).json({
        error: {
          message: "Invalid username and/or password.",
          code: "UNAUTHORIZED",
          errorId: crypto.randomUUID(),
        },
      });
    }

    return res.status(400).json({
      error: {
        message: "The information you submitted was rejected. Please check the highlighted fields.",
        code: "VALIDATION_FAILED",
        // Field names and human-readable reasons only. No echo of the value.
        fields: result.error.issues.map((issue) => ({
          field: issue.path.slice(1).join(".") || issue.path.join("."),
          reason: issue.message,
        })),
      },
    });
  }

  /**
   * req.body is REPLACED with the parsed, strict-checked result — it is not
   * merely accompanied by it.
   *
   * That matters: a controller reading `req.body` on a validated route is
   * reading validated data, so the guarantee does not depend on every author
   * remembering to reach for `req.validated` instead. `req.validated` is still
   * exposed because it also carries the parsed `params` and `query`, where
   * numeric transforms (pagination, for instance) have been applied and Express
   * would otherwise hand back the raw strings.
   *
   * The guarantee holds only for routes that mount this middleware. Every
   * POST/PUT/PATCH route in the application does.
   */
  req.validated = result.data;
  req.body = result.data.body;
  return next();
};

export default validate;
