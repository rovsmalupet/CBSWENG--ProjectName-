/**
 * errorHandler.js — the one place an error becomes a response.
 * [CSSECDV 2.4.1, 2.4.2]
 *
 * The requirement is to "use error handlers that do not display debugging or
 * stack trace information" and to "implement generic error messages".
 *
 * The controllers used to do the opposite, in about fifteen places:
 *
 *     res.status(500).json({ error: err.message })
 *     res.status(500).json({ error: err.message, code: err.code, details: err.meta })
 *
 * A Prisma failure therefore handed the caller table names, column names, and
 * constraint identifiers; a programming error handed them internal state.
 *
 * The rule here is inverted. Only an AppError — an error a developer
 * deliberately constructed with a message meant for a user — has its text
 * forwarded. Everything else becomes one fixed sentence. Full detail, including
 * the stack, goes to the security log under a correlation id that the user is
 * shown, so an administrator can find the exact event the user is describing
 * without any of it crossing the wire.
 */

import crypto from "crypto";

import { AppError } from "../errors/AppError.js";
import { logSecurityEvent, EVENTS, OUTCOME, SEVERITY } from "../security/securityLog.js";
import { removeUploadedFile } from "./uploadMiddleware.js";

/**
 * Prisma error codes mapped to safe messages.
 *
 * Prisma's own message names the model and field that failed, which is a schema
 * disclosure. These replacements say what happened without saying where.
 */
const PRISMA_ERRORS = {
  P2002: { status: 409, message: "That value is already in use." },
  P2003: { status: 409, message: "That action conflicts with related records." },
  P2025: { status: 404, message: "We could not find what you were looking for." },
  P2014: { status: 409, message: "That change would break a required relationship." },
};

const UPLOAD_VALIDATION_CODES = new Set([
  "UNSUPPORTED_FILE_TYPE",
  "UNSAFE_FILENAME",
  "EXTENSION_MISMATCH",
  "FILE_CONTENT_MISMATCH",
  "UPLOAD_REJECTED",
]);

const requestPath = (req) => req?.originalUrl?.split("?")[0] ?? req?.path ?? "(unknown route)";
const isLoginRequest = (req) => req?.method === "POST" && requestPath(req) === "/login";

/** Return only the safe, intentional fields that may cross the HTTP boundary. */
export const classifyError = (err, req = {}) => {
  const malformedBodyFailure =
    err?.type === "entity.parse.failed" ||
    (err instanceof SyntaxError && err?.status === 400 && Object.hasOwn(err, "body"));
  const parserFailure =
    err?.type === "entity.too.large" ||
    malformedBodyFailure;
  const uploadValidationFailure =
    err instanceof AppError && UPLOAD_VALIDATION_CODES.has(err.code);

  if (parserFailure && isLoginRequest(req)) {
    return {
      statusCode: 401,
      message: "Invalid username and/or password.",
      code: "UNAUTHORIZED",
      details: undefined,
      eventType: EVENTS.LOGIN_FAILURE,
      validationFailure: true,
      unexpected: false,
    };
  }

  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      message: err.message,
      code: err.code,
      details: err.statusCode < 500 ? err.details : undefined,
      eventType: uploadValidationFailure
        ? EVENTS.INPUT_VALIDATION_FAILURE
        : EVENTS.UNHANDLED_ERROR,
      validationFailure: uploadValidationFailure,
      unexpected: err.statusCode >= 500,
    };
  }

  if (err?.code && PRISMA_ERRORS[err.code]) {
    const mapped = PRISMA_ERRORS[err.code];
    return {
      statusCode: mapped.status,
      message: mapped.message,
      code: "DATABASE_CONSTRAINT",
      details: undefined,
      eventType: EVENTS.UNHANDLED_ERROR,
      validationFailure: false,
      unexpected: false,
    };
  }

  if (err?.type === "entity.too.large") {
    return {
      statusCode: 413,
      message: "That request was too large.",
      code: "PAYLOAD_TOO_LARGE",
      details: undefined,
      eventType: EVENTS.INPUT_VALIDATION_FAILURE,
      validationFailure: true,
      unexpected: false,
    };
  }

  if (malformedBodyFailure) {
    return {
      statusCode: 400,
      message: "We could not read that request.",
      code: "MALFORMED_REQUEST",
      details: undefined,
      eventType: EVENTS.INPUT_VALIDATION_FAILURE,
      validationFailure: true,
      unexpected: false,
    };
  }

  return {
    statusCode: 500,
    message: "Something went wrong on our end. Please try again.",
    code: "INTERNAL_ERROR",
    details: undefined,
    eventType: EVENTS.UNHANDLED_ERROR,
    validationFailure: false,
    unexpected: true,
  };
};

export const errorHandler = async (err, req, res, next) => {
  // Delegate to Express's default handler if the response has already begun —
  // trying to write a second set of headers throws and masks the real error.
  if (res.headersSent) return next(err);

  const errorId = crypto.randomUUID();

  const classification = classifyError(err, req);
  const { statusCode, message, code, details, eventType, validationFailure, unexpected } =
    classification;

  // A file has no durable owner until its controller finishes successfully.
  // Any downstream validation, authorization, or persistence error removes it.
  await removeUploadedFile(req.file);

  // FULL detail — server side only.
  if (!err?.validationLogged) {
    await logSecurityEvent(req, {
      eventType,
      outcome: OUTCOME.FAILURE,
      severity: unexpected ? SEVERITY.CRITICAL : SEVERITY.WARN,
      message: validationFailure
        ? `Input rejected for ${req.method} ${requestPath(req)} (${code}).`
        : `[${errorId}] ${err?.name ?? "Error"}: ${err?.message ?? "unknown"}`,
      metadata: validationFailure
        ? { errorId, statusCode, code }
        : {
            errorId,
            statusCode,
            name: err?.name,
            prismaCode: err?.code,
            // The stack stays in the administrator-only audit log.
            stack:
              typeof err?.stack === "string"
                ? err.stack.split("\n").slice(0, 12).join("\n")
                : null,
          },
    });
  }

  if (unexpected) {
    // Also to the server console, so an operator watching logs sees it live.
    console.error(`[${errorId}]`, err);
  }

  // GENERIC detail — client side.
  res.status(statusCode).json({
    error: {
      message,
      code,
      // Quotable by the user, findable by an administrator. Reveals nothing on
      // its own: it is a random identifier, not an internal reference.
      errorId,
      ...(details !== undefined ? { details } : {}),
    },
  });
};

/**
 * Terminal 404. Reached only when nothing else matched — the access-control
 * layer denies unknown routes earlier, so this mostly catches static paths.
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: { message: "We could not find what you were looking for.", code: "NOT_FOUND" },
  });
};

/**
 * Last-resort process handlers.
 *
 * Without these Node prints a raw stack trace to stdout and, for an unhandled
 * rejection, exits with a non-zero code and no record of why. Logging first
 * means the reason survives in the audit log.
 */
export const installProcessHandlers = () => {
  process.on("unhandledRejection", async (reason) => {
    console.error("Unhandled promise rejection:", reason);
    await logSecurityEvent(null, {
      eventType: EVENTS.UNHANDLED_ERROR,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.CRITICAL,
      message: `Unhandled promise rejection: ${reason?.message ?? String(reason)}`,
      metadata: { stack: reason?.stack?.split("\n").slice(0, 12).join("\n") },
    }).catch(() => {});
  });

  process.on("uncaughtException", async (error) => {
    console.error("Uncaught exception:", error);
    await logSecurityEvent(null, {
      eventType: EVENTS.UNHANDLED_ERROR,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.CRITICAL,
      message: `Uncaught exception: ${error.message}`,
      metadata: { stack: error.stack?.split("\n").slice(0, 12).join("\n") },
    }).catch(() => {});

    // The process state is unknown after an uncaught exception. Exit and let
    // the supervisor restart cleanly rather than serve requests from a
    // possibly-corrupt process.
    process.exit(1);
  });
};

export default errorHandler;
