/**
 * Security logging. [CSSECDV 2.4.3 – 2.4.7]
 *
 * The redaction tests matter most. A log that captures the password from a
 * failed sign-in is worse than no log at all: it turns an admin-only read page
 * into a credential dump, and the audit trail becomes the most valuable target
 * in the system.
 */

import { suite, test, assert, assertEqual, assertIncludes } from "./_harness.mjs";
import { EVENTS, OUTCOME, SEVERITY, redact, clientIp } from "../security/securityLog.js";

suite("Security log — redaction never lets a secret through [2.4.5]");

const secretKeys = [
  "password",
  "newPassword",
  "confirmPassword",
  "currentPassword",
  "passwordHash",
  "token",
  "resetToken",
  "reauthToken",
  "answer",
  "securityAnswer",
  "authorization",
  "cookie",
  "apiKey",
  "api_key",
  "clientSecret",
  "creditCard",
  "cvv",
];

for (const key of secretKeys) {
  test(`"${key}" is redacted`, () => {
    const result = redact({ [key]: "hunter2-the-real-value" });
    assertEqual(result[key], "[REDACTED]");
  });
}

test("redaction is case-insensitive and matches substrings", () => {
  const result = redact({
    PASSWORD: "x",
    User_Password: "x",
    bearerToken: "x",
    SecurityAnswer: "x",
  });
  for (const value of Object.values(result)) assertEqual(value, "[REDACTED]");
});

test("secrets nested inside objects are redacted", () => {
  const result = redact({ request: { body: { email: "a@b.com", password: "hunter2" } } });
  assertEqual(result.request.body.password, "[REDACTED]");
  // Non-secret context survives, or the log would be useless.
  assertEqual(result.request.body.email, "a@b.com");
});

test("a sensitive key is redacted WHOLE, even when it holds a structure", () => {
  // "answers" matches the sensitive-key pattern, so the entire array is
  // replaced rather than being walked into. That is deliberate: recursing
  // would mean trusting every inner key name to be individually recognised,
  // and one unanticipated name ("secret_value", "raw") would leak. Redacting
  // the whole branch has no such hole.
  const result = redact({
    answers: [
      { questionKey: "first_concert", answer: "Eraserheads" },
      { questionKey: "street_age_ten", answer: "Mapagmahal" },
    ],
  });
  assertEqual(result.answers, "[REDACTED]");
});

test("secrets nested under a NON-sensitive key are still caught by recursion", () => {
  // This is the case the walk exists for: an innocuous wrapper name with a
  // secret somewhere inside it.
  const result = redact({
    payload: [
      { email: "a@b.com", password: "hunter2" },
      { email: "c@d.com", currentPassword: "hunter3" },
    ],
  });
  assertEqual(result.payload[0].password, "[REDACTED]");
  assertEqual(result.payload[1].currentPassword, "[REDACTED]");
  // Non-secret context survives, or the log entry would be useless.
  assertEqual(result.payload[0].email, "a@b.com");
  assert(!JSON.stringify(result).includes("hunter"), "a password survived redaction");
});

test("a realistic failed-login payload leaks nothing", () => {
  const result = redact({
    email: "victim@example.com",
    password: "TheActualPassword123!",
    attempts: 3,
    reason: "bad_password",
  });
  assertEqual(result.password, "[REDACTED]");
  assertEqual(result.email, "victim@example.com");
  assertEqual(result.attempts, 3);
  assert(!JSON.stringify(result).includes("TheActualPassword"), "the password survived redaction");
});

suite("Security log — bounded output");

test("long strings are truncated so one request cannot bloat the table", () => {
  const result = redact({ note: "x".repeat(5000) });
  assert(result.note.length < 600);
  assertIncludes(result.note, "[truncated]");
});

test("deeply nested structures stop recursing", () => {
  let deep = { value: "bottom" };
  for (let i = 0; i < 20; i += 1) deep = { nested: deep };
  const result = redact(deep);
  assertIncludes(JSON.stringify(result), "too deep");
});

test("long arrays are capped", () => {
  const result = redact(Array.from({ length: 500 }, (_, index) => index));
  assert(result.length <= 50);
});

test("primitives and dates pass through unharmed", () => {
  assertEqual(redact(42), 42);
  assertEqual(redact(true), true);
  assertEqual(redact(null), null);
  assertEqual(redact("plain"), "plain");
  assertEqual(redact(new Date("2026-08-09T00:00:00.000Z")), "2026-08-09T00:00:00.000Z");
});

suite("Security log — the event catalogue [2.4.3]");

/**
 * "Logging controls should support both success and failure of specified
 * security events." Each pair below is asserted to exist so a future edit
 * cannot remove one half and leave the requirement half-met.
 */
const requiredPairs = [
  ["LOGIN_SUCCESS", "LOGIN_FAILURE"],
  ["REGISTRATION_SUCCESS", "REGISTRATION_FAILURE"],
  ["PASSWORD_CHANGE_SUCCESS", "PASSWORD_CHANGE_FAILURE"],
  ["PASSWORD_RESET_SUCCESS", "PASSWORD_RESET_FAILURE"],
  ["SECURITY_ANSWER_SUCCESS", "SECURITY_ANSWER_FAILURE"],
  ["REAUTH_SUCCESS", "REAUTH_FAILURE"],
  ["ACCOUNT_LOCKED", "ACCOUNT_UNLOCKED"],
  ["PAYMENT_CONFIRMED", "PAYMENT_CONFIRM_REJECTED"],
  ["REFUND_ISSUED", "REFUND_REJECTED"],
  ["CONTRIBUTION_CONFIRMED", "CONTRIBUTION_DECLINED"],
  ["ACCESS_GRANTED_SENSITIVE", "ACCESS_DENIED_ROLE"],
];

for (const [success, failure] of requiredPairs) {
  test(`${success} / ${failure} are both defined`, () => {
    assert(EVENTS[success] === success, `${success} missing from the catalogue`);
    assert(EVENTS[failure] === failure, `${failure} missing from the catalogue`);
  });
}

test("authentication attempts are covered [2.4.6]", () => {
  for (const event of ["LOGIN_SUCCESS", "LOGIN_FAILURE", "LOGOUT", "ACCOUNT_LOCKED"]) {
    assert(EVENTS[event], `${event} missing`);
  }
});

test("access-control failures are covered, with a distinct reason each [2.4.7]", () => {
  const denials = Object.keys(EVENTS).filter((key) => key.startsWith("ACCESS_DENIED"));
  // Denials are not lumped together: an administrator can tell an unauthenticated
  // request from a wrong role from someone else's data from a missing policy.
  assert(denials.length >= 5, `expected several distinct denial reasons, found ${denials.length}`);
  for (const expected of [
    "ACCESS_DENIED_NO_POLICY",
    "ACCESS_DENIED_UNAUTHENTICATED",
    "ACCESS_DENIED_ROLE",
    "ACCESS_DENIED_OWNERSHIP",
    "ACCESS_DENIED_REAUTH_REQUIRED",
  ]) {
    assert(EVENTS[expected], `${expected} missing`);
  }
});

test("input validation failures are covered [2.4.5]", () => {
  assert(EVENTS.INPUT_VALIDATION_FAILURE);
});

test("reading the log is itself a logged event [2.4.4]", () => {
  assert(EVENTS.SECURITY_LOG_VIEWED);
});

test("outcome and severity vocabularies are closed sets", () => {
  assertEqual(Object.keys(OUTCOME).sort(), ["FAILURE", "SUCCESS"]);
  assertEqual(Object.keys(SEVERITY).sort(), ["CRITICAL", "INFO", "WARN"]);
});

test("the catalogue is frozen against accidental mutation at runtime", () => {
  assert(Object.isFrozen(EVENTS));
  assert(Object.isFrozen(OUTCOME));
  assert(Object.isFrozen(SEVERITY));
});

suite("Security log — client address extraction");

test("an IPv4-mapped IPv6 address is normalised", () => {
  assertEqual(clientIp({ ip: "::ffff:203.0.113.44" }), "203.0.113.44");
});

test("falls back to the socket address", () => {
  assertEqual(clientIp({ socket: { remoteAddress: "198.51.100.9" } }), "198.51.100.9");
});

test("a missing request does not throw", () => {
  assertEqual(clientIp(null), null);
  assertEqual(clientIp({}), null);
});

test("an absurdly long forwarded address is truncated", () => {
  assert(clientIp({ ip: "1".repeat(500) }).length <= 45);
});
