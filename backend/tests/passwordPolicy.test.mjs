/**
 * Password policy. [CSSECDV 2.1.3, 2.1.5, 2.1.6]
 */

import { suite, test, asyncTest, assert, assertEqual, assertIncludes } from "./_harness.mjs";
import {
  validatePassword,
  hashPassword,
  verifyPassword,
  rehashIfNeeded,
  checkPasswordAge,
  SALT_ROUNDS,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
} from "../security/passwordPolicy.js";

const GOOD = "Kalinga!Tulay72";

suite("Password policy — length [2.1.6]");

test("a compliant password is accepted", () => {
  const result = validatePassword(GOOD);
  assert(result.valid, `expected valid, got: ${result.failures.join(" | ")}`);
});

test(`fewer than ${MIN_PASSWORD_LENGTH} characters is rejected`, () => {
  const result = validatePassword("Ab1!efgh"); // 8 chars, passes complexity
  assert(!result.valid);
  assertIncludes(result.failures, "at least 12 characters");
});

test("the old six-character minimum would now be rejected", () => {
  // The previous implementation accepted anything with length >= 6.
  assert(!validatePassword("abc123").valid);
});

test(`more than ${MAX_PASSWORD_LENGTH} characters is rejected, not truncated`, () => {
  // bcrypt silently ignores bytes past 72. Truncating would mean storing
  // something other than what the user typed, which 2.3.1 forbids.
  const result = validatePassword("Aa1!" + "x".repeat(70));
  assert(!result.valid);
  assertIncludes(result.failures, "no more than 64 characters");
});

test("a password under 64 characters but over 72 bytes is rejected", () => {
  // 30 multi-byte characters plus the required classes: under the character
  // limit, over bcrypt's byte limit.
  const result = validatePassword("Aa1!" + "é".repeat(40));
  assert(!result.valid);
  assertIncludes(result.failures, "too long once encoded");
});

suite("Password policy — complexity [2.1.5]");

const complexityCases = [
  ["kalinga!tulay72", "uppercase letter"],
  ["KALINGA!TULAY72", "lowercase letter"],
  ["KalingaTulayAbc!", "number"],
  ["KalingaTulay7212", "symbol"],
];

for (const [password, expectedFailure] of complexityCases) {
  test(`"${password}" is rejected for missing a ${expectedFailure}`, () => {
    const result = validatePassword(password);
    assert(!result.valid);
    assertIncludes(result.failures, expectedFailure);
  });
}

test("leading or trailing whitespace is rejected rather than trimmed", () => {
  const result = validatePassword(` ${GOOD} `);
  assert(!result.valid);
  assertIncludes(result.failures, "must not begin or end with a space");
});

suite("Password policy — common passwords [2.1.5]");

test('"Password123!" is rejected despite satisfying every character rule', () => {
  // This is the case the complexity rules alone cannot catch, and the reason
  // the denylist matches on the alphabetic core rather than the whole string.
  const result = validatePassword("Password123!");
  assert(!result.valid);
  assertIncludes(result.failures, "commonly guessed word");
});

const disguisedCommonPasswords = [
  "P@ssw0rd2026!",
  "Welcome2026!!",
  "Qwerty12345!A",
  "L3tm3in2026!!",
  "Adm1nistrator!",
  "Bayanihub2026!",
];

for (const password of disguisedCommonPasswords) {
  test(`leetspeak disguise "${password}" is still caught`, () => {
    assert(!validatePassword(password).valid, `${password} should have been rejected`);
  });
}

test("a single repeated character is rejected", () => {
  assert(!validatePassword("aaaaaaaaaaaaA1!").valid);
});

test("a long sequential run is rejected", () => {
  assert(!validatePassword("Xabcdefg12345!z").valid);
});

suite("Password policy — contextual [2.1.5]");

test("a password containing the user's name is rejected", () => {
  const result = validatePassword("Mariano!Secure7", { firstName: "Mariano", lastName: "Cruz" });
  assert(!result.valid);
  assertIncludes(result.failures, "must not contain your name");
});

test("a password containing the email local-part is rejected", () => {
  const result = validatePassword("Redcross!Str0ng", { email: "redcross@example.org" });
  assert(!result.valid);
});

test("a password containing the organization name is rejected", () => {
  const result = validatePassword("Bantay!Kalikasan9", { orgName: "Bantay Kalikasan" });
  assert(!result.valid);
});

test("short identity fragments do not cause false rejections", () => {
  // A two-letter surname must not blacklist every password containing it.
  const result = validatePassword(GOOD, { firstName: "Li", lastName: "Ng" });
  assert(result.valid, `unexpected failures: ${result.failures.join(" | ")}`);
});

suite("Password policy — hashing [2.1.3]");

await asyncTest("hashes are bcrypt at the configured cost factor", async () => {
  const hash = await hashPassword(GOOD);
  assert(hash.startsWith("$2"), "not a bcrypt hash");
  assertIncludes(hash, `$${SALT_ROUNDS}$`);
});

await asyncTest("the same password produces different hashes — the salt is per-password", async () => {
  const [a, b] = await Promise.all([hashPassword(GOOD), hashPassword(GOOD)]);
  assert(a !== b, "identical hashes means the salt is not random");
});

await asyncTest("verification succeeds for the right password and fails for the wrong one", async () => {
  const hash = await hashPassword(GOOD);
  assert(await verifyPassword(GOOD, hash));
  assert(!(await verifyPassword(GOOD + "x", hash)));
});

await asyncTest("verifying against a malformed hash returns false rather than throwing", async () => {
  // Fail securely: a corrupted hash column must deny the login, not crash the
  // request in a way that could be handled differently upstream. [2.1.2]
  assertEqual(await verifyPassword(GOOD, "not-a-hash"), false);
  assertEqual(await verifyPassword(GOOD, ""), false);
  assertEqual(await verifyPassword(GOOD, null), false);
});

await asyncTest("a legacy cost-10 hash still verifies and is flagged for upgrade", async () => {
  const bcrypt = (await import("bcrypt")).default;
  const legacy = await bcrypt.hash(GOOD, 10); // the cost this project used before
  assert(await verifyPassword(GOOD, legacy), "existing passwords must keep working");

  const upgraded = await rehashIfNeeded(GOOD, legacy);
  assert(upgraded !== null, "a cost-10 hash should be scheduled for rehashing");
  assertIncludes(upgraded, `$${SALT_ROUNDS}$`);
  assert(await verifyPassword(GOOD, upgraded));
});

await asyncTest("a current-cost hash is not rehashed unnecessarily", async () => {
  const current = await hashPassword(GOOD);
  assertEqual(await rehashIfNeeded(GOOD, current), null);
});

suite("Password policy — minimum age [2.1.11]");

const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000);

test("a password changed 3 days ago may be changed again", () => {
  const result = checkPasswordAge({ passwordChangedAt: hoursAgo(72), mustChangePassword: false });
  assert(result.allowed);
});

test("a password changed 2 hours ago may not be changed again", () => {
  const result = checkPasswordAge({ passwordChangedAt: hoursAgo(2), mustChangePassword: false });
  assert(!result.allowed);
  assert(result.retryAfter instanceof Date);
  assertIncludes(result.reason, "less than 24 hours ago");
});

test("the boundary is handled — exactly 24 hours old is allowed", () => {
  const result = checkPasswordAge({
    passwordChangedAt: hoursAgo(24.001),
    mustChangePassword: false,
  });
  assert(result.allowed);
});

test("mustChangePassword bypasses the age rule exactly once", () => {
  // Without this an admin-forced reset would be blocked by the very control it
  // triggered, leaving the user unable to set their own password for a day.
  const result = checkPasswordAge({ passwordChangedAt: hoursAgo(0), mustChangePassword: true });
  assert(result.allowed);
});
