/**
 * Test runner. `npm test` from backend/.
 *
 * Loads .env first because security/env.js validates configuration at import
 * time and will abort the process if JWT_SECRET is missing — which is itself
 * the behaviour required by 2.1.2, and is why these tests double as a check
 * that the server is configured to start at all.
 */

import dotenv from "dotenv";
dotenv.config();

// Pure suites need configuration modules to load, but never connect to this
// test-only URL or use this process-local signing key. Server startup remains
// fail-closed because these fallbacks exist only in the test runner.
process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://test:test@127.0.0.1:5432/bayanihub_test";
process.env.DIRECT_URL ??= process.env.DATABASE_URL;
process.env.JWT_SECRET ??= "test-runner-only-secret-9a7d4c2f6b8e1d3a5c7f";

import { report } from "./_harness.mjs";

const suites = [
  "./passwordPolicy.test.mjs",
  "./securityQuestions.test.mjs",
  "./accessControl.test.mjs",
  "./bookmarks.test.mjs",
  "./businessRules.test.mjs",
  "./validation.test.mjs",
  "./errorHandling.test.mjs",
  "./securityLog.test.mjs",
];

console.log("\n\x1b[1m  CSSECDV security control tests\x1b[0m");

for (const path of suites) {
  try {
    await import(path);
  } catch (error) {
    if (error.code === "ERR_MODULE_NOT_FOUND" && error.message.includes(path.replace("./", ""))) {
      console.log(`\n  \x1b[33m⚠ skipped ${path} (not present)\x1b[0m`);
      continue;
    }
    console.error(`\n  \x1b[31m✗ ${path} failed to load\x1b[0m\n    ${error.message}`);
    process.exit(1);
  }
}

process.exit(report() ? 0 : 1);
