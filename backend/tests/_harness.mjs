/**
 * A minimal test harness.
 *
 * Deliberately dependency-free: these tests must be runnable by a grader with
 * nothing but `npm test`, on a machine with no database and no network. Every
 * suite here exercises pure decision logic — the password policy, the access
 * control matcher, the question catalogue, the business rules — which is
 * exactly the code where a mistake becomes a vulnerability.
 */

let passed = 0;
let failed = 0;
const failures = [];
let currentSuite = "";

export const suite = (name) => {
  currentSuite = name;
  console.log(`\n\x1b[1m${name}\x1b[0m`);
};

export const test = (description, fn) => {
  try {
    fn();
    passed += 1;
    console.log(`  \x1b[32m✓\x1b[0m ${description}`);
  } catch (error) {
    failed += 1;
    failures.push({ suite: currentSuite, description, message: error.message });
    console.log(`  \x1b[31m✗ ${description}\x1b[0m`);
    console.log(`      ${error.message}`);
  }
};

export const asyncTest = async (description, fn) => {
  try {
    await fn();
    passed += 1;
    console.log(`  \x1b[32m✓\x1b[0m ${description}`);
  } catch (error) {
    failed += 1;
    failures.push({ suite: currentSuite, description, message: error.message });
    console.log(`  \x1b[31m✗ ${description}\x1b[0m`);
    console.log(`      ${error.message}`);
  }
};

export const assert = (condition, message) => {
  if (!condition) throw new Error(message ?? "Expected condition to be true");
};

export const assertEqual = (actual, expected, message) => {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${message ? message + ": " : ""}expected ${e}, received ${a}`);
  }
};

export const assertIncludes = (haystack, needle, message) => {
  const found = Array.isArray(haystack)
    ? haystack.some((item) => String(item).includes(needle))
    : String(haystack).includes(needle);
  if (!found) {
    throw new Error(
      `${message ? message + ": " : ""}expected to find "${needle}" in ${JSON.stringify(haystack)}`,
    );
  }
};

export const report = () => {
  console.log("\n" + "─".repeat(60));
  if (failed === 0) {
    console.log(`\x1b[32m  ${passed} passed\x1b[0m`);
  } else {
    console.log(`\x1b[31m  ${failed} failed\x1b[0m, ${passed} passed`);
    for (const failure of failures) {
      console.log(`    · ${failure.suite} › ${failure.description}`);
    }
  }
  console.log("─".repeat(60) + "\n");
  return failed === 0;
};
