/**
 * passwordPolicy.js — the single authority on passwords.
 *
 * Covers CSSECDV 2.1.3 (hashing), 2.1.5 (complexity), 2.1.6 (length),
 * 2.1.10 (re-use), and 2.1.11 (minimum age).
 *
 * Registration, admin provisioning, self-service change, and password reset all
 * route through here. Before this module those four paths each had their own
 * idea of what a valid password was — the weakest one (`length >= 6`) defined
 * the real security of the system, because an attacker only needs the weakest
 * door. One module means one answer.
 */

import bcrypt from "bcrypt";
import prisma from "../prisma/client.js";
import config from "./env.js";
import { EXACT_COMMON_PASSWORDS, COMMON_PASSWORD_BASES } from "./commonPasswords.js";

/**
 * bcrypt cost factor. 12 ≈ 250 ms per hash on typical hardware — imperceptible
 * on a login, ruinous for an offline cracking rig. Raised from the 10 this
 * project previously used.
 *
 * The cost is embedded in every bcrypt hash string, so raising this does NOT
 * invalidate existing passwords: old hashes still verify at their original
 * cost, and rehashIfNeeded() below upgrades each one the next time its owner
 * signs in.
 */
export const SALT_ROUNDS = 12;

// ── Length [2.1.6] ─────────────────────────────────────────────────────────
export const MIN_PASSWORD_LENGTH = 12;
/**
 * bcrypt silently ignores everything past 72 BYTES. A user who sets a
 * 100-character passphrase would believe they have far more protection than
 * they do. We cap below that and reject anything longer rather than truncating,
 * because silently discarding half of someone's password is exactly the kind of
 * "helpful" sanitizing that 2.3.1 forbids.
 */
export const MAX_PASSWORD_LENGTH = 64;
const BCRYPT_MAX_BYTES = 72;

/* ═══════════════════════════════════════════════════════════════════════════
 * POLICY
 * ═══════════════════════════════════════════════════════════════════════════ */

/** Published so the UI can render the same rules the server enforces. */
export const POLICY_DESCRIPTION = Object.freeze([
  `Between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters long`,
  "At least one lowercase letter (a–z)",
  "At least one uppercase letter (A–Z)",
  "At least one number (0–9)",
  "At least one symbol (for example ! ? @ # $ % & *)",
  "Not a commonly used or easily guessed password",
  "Does not contain your name, email address, or organization name",
  "Different from your recent passwords",
]);

/**
 * Undo the common leetspeak substitutions so "P@ssw0rd" reduces to "password".
 */
const deLeet = (value) =>
  value
    .replace(/[@4]/g, "a")
    .replace(/3/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/0/g, "o")
    .replace(/[$5]/g, "s")
    .replace(/7/g, "t");

/**
 * Every plausible "word" hiding inside a password.
 *
 * Naively stripping non-letters is not enough. "Qwerty12345!A" collapses to
 * "qwertya", and de-leeting first turns the digits of "2026" into letters and
 * corrupts the word. So we build candidates from BOTH the raw string and the
 * de-leeted string, and from each take the maximal runs of letters as well as
 * the fully-stripped concatenation. One of those exposes the base word in every
 * disguise we care about:
 *
 *   Password123!   → raw runs             → "password"
 *   Qwerty12345!A  → raw runs             → "qwerty"
 *   P@ssw0rd2026!  → de-leeted runs       → "password"
 *   Adm1nistrator! → de-leeted, ! dropped → "administrator"
 *   Pa1ss2word     → stripped whole       → "password"
 *
 * "!" is genuinely ambiguous — it stands in for "i" inside a word, but is far
 * more often just a trailing flourish. Trying it both ways costs one extra
 * pass and catches both "Adm1nistrator!" and "P@ss!word".
 */
const candidateWords = (lowered) => {
  const variants = [
    lowered,
    deLeet(lowered),
    deLeet(lowered.replace(/[!|]/g, "")), // "!" as noise rather than as "i"
  ];

  const candidates = new Set();
  for (const variant of variants) {
    for (const run of variant.match(/[a-z]+/g) ?? []) candidates.add(run);
    candidates.add(variant.replace(/[^a-z]/g, ""));
  }
  return [...candidates].filter((word) => word.length >= 4);
};

const containsCommonBase = (lowered) =>
  candidateWords(lowered).some((word) => COMMON_PASSWORD_BASES.has(word));

/**
 * True when the password contains the user's own identity.
 *
 * Multi-word values are also checked word by word: an organization called
 * "Bantay Kalikasan" must reject "Bantay!Kalikasan9", which contains neither
 * the full name (the space became "!") nor either word in isolation unless we
 * split it. Comparison runs against the letters-only form too, so "B4ntay"
 * does not slip through.
 */
const containsIdentity = (lowered, context) => {
  const rawParts = [
    context.email?.split("@")[0],
    context.firstName,
    context.lastName,
    context.orgName,
  ].filter((part) => typeof part === "string" && part.trim().length > 0);

  const fragments = new Set();
  for (const part of rawParts) {
    const normalized = part.trim().toLowerCase();
    if (normalized.length >= 4) fragments.add(normalized);
    // Individual words, and the whole thing with separators removed.
    for (const word of normalized.split(/[^a-z0-9]+/)) {
      if (word.length >= 4) fragments.add(word);
    }
    const squashed = normalized.replace(/[^a-z0-9]/g, "");
    if (squashed.length >= 4) fragments.add(squashed);
  }

  if (fragments.size === 0) return false;

  const haystacks = [lowered, lowered.replace(/[^a-z0-9]/g, ""), deLeet(lowered)];
  for (const fragment of fragments) {
    if (haystacks.some((haystack) => haystack.includes(fragment))) return true;
  }
  return false;
};

/**
 * Validate a candidate password against the full policy.
 *
 * @param {string} password
 * @param {object} [context] identity values the password must not contain
 * @param {string} [context.email]
 * @param {string} [context.firstName]
 * @param {string} [context.lastName]
 * @param {string} [context.orgName]
 * @returns {{ valid: boolean, failures: string[] }}
 */
export const validatePassword = (password, context = {}) => {
  const failures = [];

  if (typeof password !== "string" || password.length === 0) {
    return { valid: false, failures: ["A password is required."] };
  }

  // ── Length [2.1.6] ───────────────────────────────────────────────────────
  if (password.length < MIN_PASSWORD_LENGTH) {
    failures.push(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
  }
  if (password.length > MAX_PASSWORD_LENGTH) {
    failures.push(`Password must be no more than ${MAX_PASSWORD_LENGTH} characters long.`);
  }
  if (Buffer.byteLength(password, "utf8") > BCRYPT_MAX_BYTES) {
    // Reachable below 64 characters when the password uses multi-byte
    // characters (accents, emoji, non-Latin scripts).
    failures.push(
      "Password is too long once encoded. Please use fewer accented or symbol characters.",
    );
  }

  // ── Complexity [2.1.5] ───────────────────────────────────────────────────
  if (!/[a-z]/.test(password)) failures.push("Password must contain a lowercase letter.");
  if (!/[A-Z]/.test(password)) failures.push("Password must contain an uppercase letter.");
  if (!/[0-9]/.test(password)) failures.push("Password must contain a number.");
  if (!/[^A-Za-z0-9]/.test(password)) failures.push("Password must contain a symbol.");

  // Rejected rather than trimmed: trimming would mean the password we store is
  // not the password the user typed. [2.3.1]
  if (password !== password.trim()) {
    failures.push("Password must not begin or end with a space.");
  }

  // ── Common-password denylist [2.1.5] ─────────────────────────────────────
  const lowered = password.toLowerCase();
  if (EXACT_COMMON_PASSWORDS.has(lowered)) {
    failures.push("That password is one of the most commonly used passwords. Choose another.");
  } else if (containsCommonBase(lowered)) {
    failures.push(
      "That password is based on a commonly guessed word. Adding numbers or symbols to a common word does not make it strong.",
    );
  }

  // ── Contextual [2.1.5] ───────────────────────────────────────────────────
  if (containsIdentity(lowered, context)) {
    failures.push("Password must not contain your name, email address, or organization name.");
  }

  // A single character repeated defeats the point of the length rule:
  // "aaaaaaaaaaaaA1!" is fifteen characters of nothing.
  const letters = lowered.replace(/[^a-z]/g, "");
  if (letters.length >= 6 && /^(.)\1+$/.test(letters)) {
    failures.push("Password must not be a single repeated character.");
  }
  if (/(abcdefg|1234567|qwertyu)/i.test(password)) {
    failures.push("Password must not contain a long run of sequential characters.");
  }

  return { valid: failures.length === 0, failures };
};

/* ═══════════════════════════════════════════════════════════════════════════
 * HASHING  [2.1.3]
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * bcrypt generates a fresh random salt per call and stores it inside the hash,
 * so two accounts with the same password get different hashes and a precomputed
 * rainbow table is useless. It is also deliberately slow, which is the whole
 * point — a fast hash like SHA-256 lets an attacker try billions of candidates
 * per second against a stolen database.
 */
export const hashPassword = (plaintext) => bcrypt.hash(plaintext, SALT_ROUNDS);

/** Constant-time comparison, handled internally by bcrypt. */
export const verifyPassword = (plaintext, hash) => {
  if (typeof hash !== "string" || hash.length === 0) return Promise.resolve(false);
  return bcrypt.compare(plaintext, hash).catch(() => false);
};

/**
 * A bcrypt hash of a value nobody knows, used to burn the same CPU time as a
 * real comparison when the account does not exist.
 *
 * Without this, "unknown email" returns in ~1 ms and "wrong password" in
 * ~250 ms, and that timing difference tells an attacker which addresses are
 * registered — undoing the identical error message required by 2.1.4.
 */
export const DUMMY_HASH = bcrypt.hashSync(
  "not-a-real-password-used-only-to-equalise-timing",
  SALT_ROUNDS,
);

/** Burn a comparable amount of time when there is no account to check. */
export const wasteTime = () => bcrypt.compare("wrong", DUMMY_HASH).catch(() => false);

/**
 * Transparently upgrade a hash that was created at a lower cost factor.
 * Called after a successful login, when we hold the plaintext legitimately and
 * momentarily. Returns a new hash, or null if no upgrade is needed.
 */
export const rehashIfNeeded = async (plaintext, existingHash) => {
  try {
    if (bcrypt.getRounds(existingHash) >= SALT_ROUNDS) return null;
    return await hashPassword(plaintext);
  } catch {
    return null; // malformed hash — leave it alone rather than risk a lockout
  }
};

/* ═══════════════════════════════════════════════════════════════════════════
 * RE-USE PREVENTION  [2.1.10]
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * True when `plaintext` matches the account's current password or any of the
 * last `config.passwordHistoryDepth` it has used.
 *
 * Each stored hash carries its own salt, so this cannot be done with an index
 * lookup — every candidate must be compared individually. That is bounded and
 * acceptable at a depth of 5.
 */
export const isPasswordReused = async (accountId, plaintext) => {
  const [account, history] = await Promise.all([
    prisma.userAccount.findUnique({
      where: { id: accountId },
      select: { passwordHash: true },
    }),
    prisma.passwordHistory.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
      take: config.passwordHistoryDepth,
      select: { passwordHash: true },
    }),
  ]);

  const candidates = [account?.passwordHash, ...history.map((row) => row.passwordHash)].filter(
    Boolean,
  );

  for (const hash of candidates) {
    if (await verifyPassword(plaintext, hash)) return true;
  }
  return false;
};

/* ═══════════════════════════════════════════════════════════════════════════
 * MINIMUM AGE  [2.1.11]
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Passwords must be at least one day old before they can be changed.
 *
 * The control exists to stop someone cycling through N throwaway passwords in
 * one sitting to get back to a favourite one, which would defeat the history
 * check above. The two rules only work as a pair.
 *
 * `mustChangePassword` bypasses it exactly once: an admin who provisions or
 * force-resets an account must not leave its owner unable to set their own
 * password for 24 hours.
 *
 * @returns {{ allowed: boolean, retryAfter: Date|null, reason: string|null }}
 */
export const checkPasswordAge = (account) => {
  if (account.mustChangePassword) {
    return { allowed: true, retryAfter: null, reason: null };
  }

  const minAgeMs = config.passwordMinAgeHours * 60 * 60 * 1000;
  const changedAt = new Date(account.passwordChangedAt).getTime();
  const elapsed = Date.now() - changedAt;

  if (elapsed >= minAgeMs) {
    return { allowed: true, retryAfter: null, reason: null };
  }

  const retryAfter = new Date(changedAt + minAgeMs);
  return {
    allowed: false,
    retryAfter,
    reason: `Your password was changed less than ${config.passwordMinAgeHours} hours ago and cannot be changed again until ${retryAfter.toLocaleString("en-PH")}.`,
  };
};

/* ═══════════════════════════════════════════════════════════════════════════
 * APPLYING A NEW PASSWORD
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Write a new password and everything that must move with it, atomically.
 *
 * Bundled into one transaction because these five effects are meaningless
 * apart: a history row without the new hash, or a rotated password whose old
 * sessions stay alive, is a bug that only shows up under attack.
 *
 *  1. store the new hash
 *  2. stamp passwordChangedAt      → restarts the minimum-age clock [2.1.11]
 *  3. clear mustChangePassword     → the one-time bypass is consumed
 *  4. append to password history   → and prune beyond the retention depth [2.1.10]
 *  5. increment tokenVersion       → every existing session is invalidated, so a
 *                                    password change actually evicts an attacker
 *                                    who already holds a token
 */
export const applyNewPassword = async (accountId, plaintext) => {
  const passwordHash = await hashPassword(plaintext);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const updated = await tx.userAccount.update({
      where: { id: accountId },
      data: {
        passwordHash,
        passwordChangedAt: now,
        mustChangePassword: false,
        tokenVersion: { increment: 1 },
        // A successful password change is also a recovery path out of lockout.
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    await tx.passwordHistory.create({ data: { accountId, passwordHash } });

    const stale = await tx.passwordHistory.findMany({
      where: { accountId },
      orderBy: { createdAt: "desc" },
      skip: config.passwordHistoryDepth,
      select: { id: true },
    });
    if (stale.length > 0) {
      await tx.passwordHistory.deleteMany({
        where: { id: { in: stale.map((row) => row.id) } },
      });
    }

    return updated;
  });
};

export default {
  SALT_ROUNDS,
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  POLICY_DESCRIPTION,
  validatePassword,
  hashPassword,
  verifyPassword,
  wasteTime,
  rehashIfNeeded,
  isPasswordReused,
  checkPasswordAge,
  applyNewPassword,
};
