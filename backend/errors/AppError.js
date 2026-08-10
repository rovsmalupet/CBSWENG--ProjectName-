/**
 * AppError — an error whose message is safe to show a user.
 *
 * CSSECDV 2.4.1 / 2.4.2:
 * The central error handler treats anything that is NOT an AppError as
 * unexpected, and replaces it with a fixed generic message. That inverts the
 * default: a developer has to *opt in* to sending text to the client, so a
 * Prisma error, a TypeError, or a stack trace can never leak by accident.
 */
export class AppError extends Error {
  /**
   * @param {string} message  shown verbatim to the user — must not name a
   *                          table, column, file path, library, or internal id
   * @param {number} statusCode
   * @param {string} code     stable machine-readable code for the frontend
   * @param {object} [options]
   * @param {object} [options.details]  extra fields for the response body
   * @param {Error}  [options.cause]    original error, logged but never sent
   */
  constructor(message, statusCode = 400, code = "BAD_REQUEST", options = {}) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = options.details;
    this.cause = options.cause;
    this.isOperational = true;
    Error.captureStackTrace?.(this, AppError);
  }
}

/* ── Constructors for the situations that recur across the codebase ───────── */

export const badRequest = (message = "The information you submitted was rejected.", details) =>
  new AppError(message, 400, "BAD_REQUEST", { details });

export const unauthorized = (message = "Please sign in to continue.") =>
  new AppError(message, 401, "UNAUTHORIZED");

export const forbidden = (message = "You do not have permission to do that.") =>
  new AppError(message, 403, "FORBIDDEN");

/**
 * Also the correct answer when a user asks for a resource that exists but is
 * not theirs: a 403 confirms the row exists and turns any id into an oracle for
 * enumerating other people's data. The access-control layer still records the
 * true reason as ACCESS_DENIED_OWNERSHIP, so administrators see what really
 * happened even though the caller does not. [2.2.2]
 */
export const notFound = (message = "We could not find what you were looking for.") =>
  new AppError(message, 404, "NOT_FOUND");

export const conflict = (message = "That action conflicts with the current state of the data.") =>
  new AppError(message, 409, "CONFLICT");

export const tooManyRequests = (message = "Too many attempts. Please try again later.") =>
  new AppError(message, 429, "TOO_MANY_REQUESTS");

export default AppError;
