/** Generic error responses and validation-error classification. [2.4.1-2.4.6] */

import { suite, test, assert, assertEqual } from "./_harness.mjs";
import { AppError } from "../errors/AppError.js";
import { classifyError } from "../middleware/errorHandler.js";
import { EVENTS } from "../security/securityLog.js";

suite("Error handling - safe client responses [2.4.1, 2.4.2]");

test("an unexpected exception exposes no message, stack, or custom detail", () => {
  const error = new Error("database password leaked from C:\\internal\\driver.js");
  error.internalDetail = { table: "UserAccount" };

  const safe = classifyError(error, { method: "GET", originalUrl: "/posts" });

  assertEqual(safe.statusCode, 500);
  assertEqual(safe.code, "INTERNAL_ERROR");
  assertEqual(safe.message, "Something went wrong on our end. Please try again.");
  assertEqual(safe.details, undefined);
  assert(!Object.hasOwn(safe, "stack"), "a stack must never be part of the safe response");
  assert(!JSON.stringify(safe).includes("driver.js"), "internal error text must not cross the boundary");
});

test("a controller SyntaxError is not mistaken for malformed request JSON", () => {
  const safe = classifyError(new SyntaxError("internal parser bug"), {
    method: "GET",
    originalUrl: "/posts",
  });
  assertEqual(safe.statusCode, 500);
  assertEqual(safe.code, "INTERNAL_ERROR");
});

test("even an operational 5xx error cannot attach response details", () => {
  const error = new AppError("Payments are unavailable right now.", 503, "PAYMENTS_UNAVAILABLE", {
    details: { providerResponse: "private diagnostic" },
  });
  const safe = classifyError(error, { method: "POST", originalUrl: "/payments/intent" });

  assertEqual(safe.statusCode, 503);
  assertEqual(safe.message, "Payments are unavailable right now.");
  assertEqual(safe.details, undefined);
});

suite("Error handling - validation and authentication logging [2.4.5, 2.4.6]");

test("malformed JSON is classified as an input-validation failure", () => {
  const error = new SyntaxError("Unexpected token at position 12");
  error.type = "entity.parse.failed";
  const safe = classifyError(error, { method: "POST", originalUrl: "/posts" });

  assertEqual(safe.statusCode, 400);
  assertEqual(safe.code, "MALFORMED_REQUEST");
  assertEqual(safe.eventType, EVENTS.INPUT_VALIDATION_FAILURE);
});

test("multer rejection is classified as an input-validation failure", () => {
  const error = new AppError("That file could not be accepted.", 400, "UPLOAD_REJECTED");
  const safe = classifyError(error, { method: "POST", originalUrl: "/documents/upload" });

  assertEqual(safe.eventType, EVENTS.INPUT_VALIDATION_FAILURE);
  assertEqual(safe.code, "UPLOAD_REJECTED");
});

test("malformed login input gets the same generic authentication response", () => {
  const error = new SyntaxError("Unexpected token at position 3");
  error.type = "entity.parse.failed";
  const safe = classifyError(error, { method: "POST", originalUrl: "/login" });

  assertEqual(safe.statusCode, 401);
  assertEqual(safe.code, "UNAUTHORIZED");
  assertEqual(safe.message, "Invalid username and/or password.");
  assertEqual(safe.eventType, EVENTS.LOGIN_FAILURE);
});
