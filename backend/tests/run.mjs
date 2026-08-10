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

import { report } from "./_harness.mjs";

const suites = [
  "./passwordPolicy.test.mjs",
  "./securityQuestions.test.mjs",
  "./accessControl.test.mjs",
  "./businessRules.test.mjs",
  "./validation.test.mjs",
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
