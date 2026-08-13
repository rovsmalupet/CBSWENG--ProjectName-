/**
 * userAccountService.js — registration, sign-in, and the password lifecycle.
 *
 * Covers CSSECDV 2.1.2, 2.1.4, 2.1.8, 2.1.9, 2.1.10, 2.1.11, 2.1.12, 2.1.13.
 *
 * Authentication now runs against the single UserAccount table. The previous
 * implementation searched Admin, then Donor, then Organization, each with its
 * own password column — which meant every control in this file would otherwise
 * have had to be written and maintained three times.
 */

import crypto from "crypto";
import nodemailer from "nodemailer";

import prisma from "../prisma/client.js";
import config from "../security/env.js";
import { AppError, badRequest, conflict, unauthorized } from "../errors/AppError.js";
import {
  validatePassword,
  hashPassword,
  verifyPassword,
  wasteTime,
  rehashIfNeeded,
  isPasswordReused,
  checkPasswordAge,
  applyPreparedPassword,
  applyNewPassword,
} from "../security/passwordPolicy.js";
import {
  validateAnswerSet,
  prepareSecurityAnswers,
  setSecurityAnswers,
  getQuestionsForAccount,
  hasSecurityQuestions,
  verifySecurityAnswers,
} from "../security/securityQuestions.js";
import { issueAccessToken, issueReauthToken } from "../security/tokens.js";
import { logSecurityEvent, EVENTS, OUTCOME, SEVERITY, clientIp } from "../security/securityLog.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The ONLY message any credential failure produces. [2.1.4]
 *
 * Unknown email, wrong password, locked account, disabled account, and an
 * organization still awaiting approval all return exactly this, with the same
 * 401 status. Anything more specific tells an attacker which addresses are
 * registered, which are locked, and which are worth continuing to attack.
 *
 * The trade-off is real: an organization whose registration is still pending
 * gets an unhelpful message here. That information reaches them through their
 * registration confirmation screen and their approval email instead — channels
 * that require control of the mailbox, rather than an anonymous login probe.
 */
const GENERIC_LOGIN_FAILURE = "Invalid username and/or password.";

/* ═══════════════════════════════════════════════════════════════════════════
 * HELPERS
 * ═══════════════════════════════════════════════════════════════════════════ */

const normalizeEmail = (email) => String(email ?? "").trim().toLowerCase();

/** Load the profile row that belongs to an account, whichever table it lives in. */
const loadProfile = async (account) => {
  switch (account.role) {
    case "admin":
      return prisma.admin.findUnique({ where: { accountId: account.id } });
    case "donor":
      return prisma.donor.findUnique({ where: { accountId: account.id } });
    case "ngo":
      return prisma.organization.findUnique({ where: { accountId: account.id } });
    default:
      return null;
  }
};

/** The user-facing shape of an account. Never includes a hash. */
const publicUser = (account, profile, securityQuestionsConfigured = false) => ({
  id: profile?.id ?? null,
  accountId: account.id,
  email: account.email,
  role: account.role,
  firstName: profile?.firstName ?? null,
  lastName: profile?.lastName ?? profile?.surname ?? null,
  orgName: profile?.orgName ?? null,
  country: profile?.country ?? null,
  affiliation: profile?.affiliation ?? null,
  bio: profile?.bio ?? null,
  isVerified: profile?.isVerified ?? true,
  status: account.status,
  mustChangePassword: account.mustChangePassword,
  securityQuestionsConfigured: Boolean(securityQuestionsConfigured),
  createdAt: profile?.createdAt ?? account.createdAt,
});

/* ═══════════════════════════════════════════════════════════════════════════
 * SEEDING
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Ensure a usable administrator exists on a fresh deployment.
 *
 * The passwords this used to hard-code — "admin123" and "donor123" — were in
 * source control, failed the current policy outright, and would have been the
 * first thing anyone tried. The password now comes from the environment, and if
 * it is absent one is generated and printed ONCE to the server console so it
 * exists nowhere on disk.
 */
export const seedDefaultUsers = async () => {
  const existingAdmins = await prisma.userAccount.count({ where: { role: "admin" } });
  if (existingAdmins > 0) return;

  const configuredPassword = process.env.SEED_ADMIN_PASSWORD?.trim();
  const generated = !configuredPassword;
  const password = configuredPassword || `Bootstrap-${crypto.randomBytes(9).toString("base64url")}!7`;

  const check = validatePassword(password);
  if (!check.valid) {
    console.error(
      "  ✗ SEED_ADMIN_PASSWORD does not satisfy the password policy:\n    " +
        check.failures.join("\n    "),
    );
    return;
  }

  const account = await prisma.userAccount.create({
    data: {
      email: "admin@bayanihub.local",
      passwordHash: await hashPassword(password),
      role: "admin",
      status: "Active",
      // Forces a password change on first sign-in, and lets that change happen
      // immediately rather than being blocked by the 24-hour minimum age.
      mustChangePassword: true,
      admin: { create: { firstName: "System", lastName: "Administrator", email: "admin@bayanihub.local" } },
    },
  });

  await prisma.passwordHistory.create({
    data: { accountId: account.id, passwordHash: account.passwordHash },
  });

  console.log("\n  ┌─────────────────────────────────────────────────────────────┐");
  console.log("  │  Bootstrap administrator created                            │");
  console.log("  ├─────────────────────────────────────────────────────────────┤");
  console.log("  │  Email:    admin@bayanihub.local                            │");
  if (generated) {
    console.log(`  │  Password: ${password.padEnd(48)} │`);
    console.log("  │  (generated once — it is not stored anywhere)               │");
  } else {
    console.log("  │  Password: from SEED_ADMIN_PASSWORD                         │");
  }
  console.log("  │  You will be required to change it at first sign-in.        │");
  console.log("  └─────────────────────────────────────────────────────────────┘\n");
};

/* ═══════════════════════════════════════════════════════════════════════════
 * REGISTRATION
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Register a donor or an organization.
 *
 * `role` is NOT read from the request. The caller passes it explicitly from a
 * route that hard-codes it, so there is no request field through which someone
 * could ask to be created as an administrator. The previous implementation
 * allowlisted a body-supplied role to donor/ngo, which was correct but relied
 * on that allowlist never being widened.
 */
export const registerUser = async (input, req = null) => {
  const {
    firstName,
    surname,
    email,
    password,
    orgName,
    country,
    affiliation,
    bio,
    securityAnswers,
    role,
  } = input;

  if (role !== "donor" && role !== "ngo") {
    throw new AppError("Unsupported account type.", 400, "INVALID_ROLE");
  }

  const normalizedEmail = normalizeEmail(email);
  if (!EMAIL_REGEX.test(normalizedEmail)) {
    throw badRequest("Please provide a valid email address.");
  }

  // ── Password policy [2.1.5, 2.1.6] ─────────────────────────────────────
  const policy = validatePassword(password, {
    email: normalizedEmail,
    firstName,
    lastName: surname,
    orgName,
  });
  if (!policy.valid) {
    await logSecurityEvent(req, {
      eventType: EVENTS.REGISTRATION_FAILURE,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.INFO,
      message: "Registration rejected: password did not meet the policy.",
      actorEmail: normalizedEmail,
      metadata: { failures: policy.failures },
    });
    throw badRequest("That password does not meet our requirements.", { failures: policy.failures });
  }

  // ── Security questions [2.1.9] ──────────────────────────────────────────
  const answerCheck = validateAnswerSet(securityAnswers, config.securityQuestionCount);
  if (!answerCheck.valid) {
    throw badRequest("Please complete your security questions.", {
      failures: answerCheck.failures,
    });
  }

  const existing = await prisma.userAccount.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    // Logged so an administrator can see registration probing, but the caller
    // gets the same response shape as a success — see the controller.
    await logSecurityEvent(req, {
      eventType: EVENTS.REGISTRATION_FAILURE,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.INFO,
      message: "Registration attempted with an email that is already in use.",
      actorEmail: normalizedEmail,
    });
    throw new AppError("That email address cannot be used.", 409, "EMAIL_UNAVAILABLE");
  }

  const [passwordHash, preparedSecurityAnswers] = await Promise.all([
    hashPassword(password),
    prepareSecurityAnswers(securityAnswers),
  ]);

  // Donors are usable immediately; organizations must be approved by an
  // administrator before they can sign in.
  const accountStatus = role === "donor" ? "Active" : "Pending";

  const account = await prisma.$transaction(async (tx) => {
    const created = await tx.userAccount.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role,
        status: accountStatus,
        ...(role === "donor"
          ? {
              donor: {
                create: {
                  firstName: firstName.trim(),
                  lastName: surname.trim(),
                  email: normalizedEmail,
                  country: country || "Philippines",
                  affiliation: affiliation.trim(),
                  bio: bio?.trim() || null,
                  isVerified: true,
                  status: "Approved",
                },
              },
            }
          : {
              organization: {
                create: {
                  orgName: orgName.trim(),
                  firstName: firstName.trim(),
                  surname: surname.trim(),
                  email: normalizedEmail,
                  country: country || "Philippines",
                  bio: bio?.trim() || null,
                  isVerified: false,
                  status: "Pending",
                },
              },
            }),
      },
    });

    await tx.passwordHistory.create({ data: { accountId: created.id, passwordHash } });
    for (const answer of preparedSecurityAnswers) {
      await tx.securityAnswer.create({
        data: { accountId: created.id, ...answer },
      });
    }
    return created;
  });

  await logSecurityEvent(req, {
    eventType: EVENTS.REGISTRATION_SUCCESS,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: `New ${role} account registered.`,
    actorAccountId: account.id,
    actorEmail: normalizedEmail,
    actorRole: role,
    targetType: "UserAccount",
    targetId: account.id,
  });

  const profile = await loadProfile(account);
  return {
    message:
      role === "donor"
        ? "Registration successful. You can now sign in."
        : "Registration submitted. Your organization is pending administrator approval.",
    user: publicUser(account, profile, true),
  };
};

/* ═══════════════════════════════════════════════════════════════════════════
 * SIGN IN
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Record a failed attempt and lock the account once the threshold is reached.
 * [2.1.8, 2.1.12]
 */
const recordLoginFailure = async (account, req, reason) => {
  const attemptedAt = new Date();
  const attemptedFrom = clientIp(req);
  const lockedUntil = new Date(
    attemptedAt.getTime() + config.lockoutDurationMinutes * 60 * 1000,
  );

  const { attempts, lockStarted } = await prisma.$transaction(async (tx) => {
    // Once a lock has expired, begin a fresh threshold window. Keep the
    // since-last-login total intact because it is reported to the account owner.
    await tx.userAccount.updateMany({
      where: { id: account.id, lockedUntil: { lte: attemptedAt } },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });

    // Database-side increments serialize concurrent failures. Computing this
    // from the account object read before password verification could otherwise
    // let simultaneous guesses overwrite each other with the same value.
    const updated = await tx.userAccount.update({
      where: { id: account.id },
      data: {
        failedLoginAttempts: { increment: 1 },
        failedAttemptsSinceLogin: { increment: 1 },
        lastFailedLoginAt: attemptedAt,
        lastFailedLoginIp: attemptedFrom,
      },
      select: { failedLoginAttempts: true },
    });

    let started = false;
    if (updated.failedLoginAttempts >= config.lockoutThreshold) {
      const locked = await tx.userAccount.updateMany({
        // Do not extend an active lock when requests were already in flight.
        where: { id: account.id, lockedUntil: null },
        data: { lockedUntil },
      });
      started = locked.count === 1;
    }

    return { attempts: updated.failedLoginAttempts, lockStarted: started };
  });

  await logSecurityEvent(req, {
    eventType: EVENTS.LOGIN_FAILURE,
    outcome: OUTCOME.FAILURE,
    severity: SEVERITY.WARN,
    message: `Failed sign-in attempt (${reason}). Attempt ${attempts}; lockout threshold ${config.lockoutThreshold}.`,
    actorAccountId: account.id,
    actorEmail: account.email,
    actorRole: account.role,
    metadata: { reason, attempts },
  });

  if (lockStarted) {
    await logSecurityEvent(req, {
      eventType: EVENTS.ACCOUNT_LOCKED,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.CRITICAL,
      message: `Account locked for ${config.lockoutDurationMinutes} minutes after ${attempts} failed sign-in attempts.`,
      actorAccountId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
    });
  }
};

/**
 * Authenticate a user.
 *
 * Every failure path below returns the identical GENERIC_LOGIN_FAILURE, and the
 * paths that have no account to compare against still burn a bcrypt comparison
 * so the response time does not distinguish them. [2.1.4]
 */
export const loginUser = async ({ email, password }, req = null) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    await wasteTime();
    throw unauthorized(GENERIC_LOGIN_FAILURE);
  }

  const account = await prisma.userAccount.findUnique({ where: { email: normalizedEmail } });

  // ── No such account ─────────────────────────────────────────────────────
  if (!account) {
    await wasteTime(); // equalise timing against the real-account path
    await logSecurityEvent(req, {
      eventType: EVENTS.LOGIN_FAILURE,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.WARN,
      message: "Failed sign-in attempt for an email address with no account.",
      actorEmail: normalizedEmail,
      metadata: { reason: "unknown_account" },
    });
    throw unauthorized(GENERIC_LOGIN_FAILURE);
  }

  // ── Locked [2.1.8] ──────────────────────────────────────────────────────
  // Checked before the password comparison so a locked account cannot be used
  // as an oracle, and NOT extended on each attempt — extending the lock on
  // every try would let an attacker keep a victim permanently locked out, which
  // is the denial-of-service the specification warns against.
  if (account.lockedUntil && account.lockedUntil > new Date()) {
    await wasteTime();
    await prisma.userAccount.update({
      where: { id: account.id },
      data: {
        // Record the use without extending the lock. The owner must see every
        // attempt made against the account at their next successful sign-in.
        failedAttemptsSinceLogin: { increment: 1 },
        lastFailedLoginAt: new Date(),
        lastFailedLoginIp: clientIp(req),
      },
    });
    await logSecurityEvent(req, {
      eventType: EVENTS.LOGIN_FAILURE,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.WARN,
      message: "Sign-in attempted on a locked account.",
      actorAccountId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
      metadata: { reason: "locked", lockedUntil: account.lockedUntil },
    });
    throw unauthorized(GENERIC_LOGIN_FAILURE);
  }

  // ── Wrong password ──────────────────────────────────────────────────────
  const passwordMatches = await verifyPassword(password, account.passwordHash);
  if (!passwordMatches) {
    await recordLoginFailure(account, req, "bad_password");
    throw unauthorized(GENERIC_LOGIN_FAILURE);
  }

  // ── Correct password, but the account may not sign in ────────────────────
  // Same message, same status code. An organization awaiting approval, a
  // rejected registration, and a disabled account are indistinguishable here.
  if (account.status !== "Active") {
    await prisma.userAccount.update({
      where: { id: account.id },
      data: {
        // This is an unsuccessful use for reporting purposes, but the password
        // was correct, so it must not advance the brute-force lockout counter.
        failedAttemptsSinceLogin: { increment: 1 },
        lastFailedLoginAt: new Date(),
        lastFailedLoginIp: clientIp(req),
      },
    });
    await logSecurityEvent(req, {
      eventType: EVENTS.LOGIN_FAILURE,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.WARN,
      message: `Sign-in refused: account state is "${account.status}".`,
      actorAccountId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
      metadata: { reason: "account_state", status: account.status },
    });
    throw unauthorized(GENERIC_LOGIN_FAILURE);
  }

  const [profile, securityQuestionsConfigured] = await Promise.all([
    loadProfile(account),
    hasSecurityQuestions(account.id),
  ]);
  if (!profile) {
    // An account with no profile row is a data integrity failure. Deny. [2.1.2]
    await logSecurityEvent(req, {
      eventType: EVENTS.LOGIN_FAILURE,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.CRITICAL,
      message: "Sign-in refused: account has no matching profile record.",
      actorAccountId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
    });
    throw unauthorized(GENERIC_LOGIN_FAILURE);
  }

  // ── Success ─────────────────────────────────────────────────────────────

  // Capture the PREVIOUS values before they are overwritten — this is exactly
  // what 2.1.12 asks us to report back to the user.
  const previousAccess = {
    lastLoginAt: account.lastLoginAt,
    lastLoginIp: account.lastLoginIp,
    lastFailedLoginAt: account.lastFailedLoginAt,
    lastFailedLoginIp: account.lastFailedLoginIp,
    failedAttemptsSinceLastLogin: account.failedAttemptsSinceLogin,
    isFirstLogin: account.lastLoginAt === null,
  };

  // Opportunistically upgrade a hash created at the old cost factor. We hold
  // the plaintext legitimately at this instant and never again.
  const upgradedHash = await rehashIfNeeded(password, account.passwordHash);

  const updated = await prisma.userAccount.update({
    where: { id: account.id },
    data: {
      failedLoginAttempts: 0,
      failedAttemptsSinceLogin: 0,
      lockedUntil: null,
      lastLoginAt: new Date(),
      lastLoginIp: clientIp(req),
      ...(upgradedHash ? { passwordHash: upgradedHash } : {}),
    },
  });

  await logSecurityEvent(req, {
    eventType: EVENTS.LOGIN_SUCCESS,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: "Successful sign-in.",
    actorAccountId: account.id,
    actorEmail: account.email,
    actorRole: account.role,
    metadata: {
      failedAttemptsSinceLastLogin: previousAccess.failedAttemptsSinceLastLogin,
      hashUpgraded: Boolean(upgradedHash),
    },
  });

  return {
    message: "Signed in successfully.",
    user: publicUser(updated, profile, securityQuestionsConfigured),
    token: issueAccessToken(updated, profile.id),
    previousAccess, // rendered as a banner on the landing page [2.1.12]
  };
};

/* ═══════════════════════════════════════════════════════════════════════════
 * SESSION
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Invalidate every outstanding token for this account.
 *
 * Previously "logging out" only cleared localStorage in the browser; the token
 * itself stayed valid for its full seven-day lifetime, so anyone who had copied
 * it kept access. Bumping tokenVersion makes sign-out mean something.
 */
export const logoutUser = async (accountId, req = null) => {
  await prisma.userAccount.update({
    where: { id: accountId },
    data: { tokenVersion: { increment: 1 } },
  });

  await logSecurityEvent(req, {
    eventType: EVENTS.LOGOUT,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: "Signed out; all sessions for this account were invalidated.",
    actorAccountId: accountId,
  });

  return { message: "Signed out." };
};

/** The current user, re-read from the database. Backs the frontend AuthContext. */
export const getCurrentUser = async (accountId) => {
  const account = await prisma.userAccount.findUnique({ where: { id: accountId } });
  if (!account) throw unauthorized();
  const [profile, securityQuestionsConfigured] = await Promise.all([
    loadProfile(account),
    hasSecurityQuestions(account.id),
  ]);
  return { user: publicUser(account, profile, securityQuestionsConfigured) };
};

/* ═══════════════════════════════════════════════════════════════════════════
 * RE-AUTHENTICATION  [2.1.13]
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Exchange the user's current password for a short-lived re-auth token.
 *
 * Required before changing a password, managing accounts, permanently deleting
 * a project, or issuing a refund. Holding a session is not enough: the point of
 * the control is to prove the person at the keyboard is the account owner, not
 * someone who sat down at an unlocked laptop.
 *
 * A failure here counts toward the lockout threshold, so this cannot be used as
 * an unmetered password oracle by someone with a stolen session token.
 */
export const reauthenticate = async (accountId, currentPassword, req = null) => {
  const account = await prisma.userAccount.findUnique({ where: { id: accountId } });
  if (!account) throw unauthorized();

  if (account.lockedUntil && account.lockedUntil > new Date()) {
    await wasteTime();
    await prisma.userAccount.update({
      where: { id: account.id },
      data: {
        // Record the use without extending the lock. The owner must see every
        // attempt made against the account at their next successful sign-in.
        failedAttemptsSinceLogin: { increment: 1 },
        lastFailedLoginAt: new Date(),
        lastFailedLoginIp: clientIp(req),
      },
    });
    await logSecurityEvent(req, {
      eventType: EVENTS.REAUTH_FAILURE,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.WARN,
      message: "Re-authentication was refused for a locked account.",
      actorAccountId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
    });
    throw unauthorized("This account is temporarily locked.");
  }

  const matches = await verifyPassword(currentPassword, account.passwordHash);
  if (!matches) {
    await recordLoginFailure(account, req, "reauth_bad_password");
    await logSecurityEvent(req, {
      eventType: EVENTS.REAUTH_FAILURE,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.WARN,
      message: "Re-authentication failed before a critical operation.",
      actorAccountId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
    });
    throw unauthorized("That password is not correct.");
  }

  await prisma.userAccount.update({
    where: { id: account.id },
    data: { failedLoginAttempts: 0 },
  });

  await logSecurityEvent(req, {
    eventType: EVENTS.REAUTH_SUCCESS,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: "Re-authenticated for a critical operation.",
    actorAccountId: account.id,
    actorEmail: account.email,
    actorRole: account.role,
  });

  return {
    reauthToken: issueReauthToken(account),
    expiresInMinutes: config.reauthTokenTtlMinutes,
  };
};

/* ═══════════════════════════════════════════════════════════════════════════
 * CHANGE PASSWORD  [2.1.10, 2.1.11, 2.1.13]
 * ═══════════════════════════════════════════════════════════════════════════ */

/**
 * The access-control layer has already verified a fresh re-auth token before
 * this runs, so the caller has proved knowledge of the current password. The
 * remaining checks are the password lifecycle rules, applied in the order that
 * gives the clearest feedback.
 */
export const changePassword = async (accountId, { newPassword }, req = null) => {
  const account = await prisma.userAccount.findUnique({ where: { id: accountId } });
  if (!account) throw unauthorized();

  const profile = await loadProfile(account);

  const fail = async (eventType, message, details) => {
    await logSecurityEvent(req, {
      eventType,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.INFO,
      message,
      actorAccountId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
    });
    throw badRequest(message, details);
  };

  // ── Minimum age [2.1.11] ────────────────────────────────────────────────
  // Bootstrap and administrator-created accounts do not yet have recovery
  // answers. Do not let an API caller clear the forced-change flag without
  // first making the account's required reset flow usable.
  if (account.mustChangePassword && !(await hasSecurityQuestions(account.id))) {
    await fail(
      EVENTS.PASSWORD_CHANGE_FAILURE,
      "Set your security questions before replacing the temporary password.",
    );
  }

  const age = checkPasswordAge(account);
  if (!age.allowed) {
    await fail(EVENTS.PASSWORD_MIN_AGE_REJECTED, age.reason);
  }

  // ── Policy [2.1.5, 2.1.6] ───────────────────────────────────────────────
  const policy = validatePassword(newPassword, {
    email: account.email,
    firstName: profile?.firstName,
    lastName: profile?.lastName ?? profile?.surname,
    orgName: profile?.orgName,
  });
  if (!policy.valid) {
    await fail(
      EVENTS.PASSWORD_CHANGE_FAILURE,
      "That password does not meet our requirements.",
      { failures: policy.failures },
    );
  }

  // ── Re-use [2.1.10] ─────────────────────────────────────────────────────
  if (await isPasswordReused(accountId, newPassword)) {
    await fail(
      EVENTS.PASSWORD_REUSE_REJECTED,
      "This password has been used recently. Please choose a different one.",
    );
  }

  await applyNewPassword(accountId, newPassword);

  await logSecurityEvent(req, {
    eventType: EVENTS.PASSWORD_CHANGE_SUCCESS,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: "Password changed; all other sessions were signed out.",
    actorAccountId: account.id,
    actorEmail: account.email,
    actorRole: account.role,
  });

  // tokenVersion has moved, so the caller's own token is now invalid too.
  return { message: "Your password has been changed. Please sign in again." };
};

/* ═══════════════════════════════════════════════════════════════════════════
 * PASSWORD RESET  [2.1.9]
 *
 * Two independent factors are required before a password changes:
 *   1. the emailed token — proves control of the mailbox
 *   2. correct security answers — proves knowledge only the owner should have
 * Neither alone is sufficient.
 * ═══════════════════════════════════════════════════════════════════════════ */

const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    const resetLink = `${process.env.RESET_PASSWORD_URL}?token=${encodeURIComponent(resetToken)}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "BayaniHub password reset request",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Password reset request</h2>
          <p>We received a request to reset the password for this account.</p>
          <p>You will be asked to answer your security questions before you can choose a new password. This link expires in 24 hours and can only be used once.</p>
          <p style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #2f6f4f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset my password</a>
          </p>
          <p>If you did not request this, you can ignore this email — your password will not change.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">BayaniHub</p>
        </div>`,
    });
    return true;
  } catch {
    return false;
  }
};

/**
 * Always reports success, whether or not the address is registered — otherwise
 * this endpoint becomes a free account-enumeration oracle.
 */
export const requestPasswordReset = async ({ email }, req = null) => {
  const normalizedEmail = normalizeEmail(email);
  const genericResponse = {
    message:
      "If an account exists for that email address, we have sent a password reset link to it.",
  };

  if (!EMAIL_REGEX.test(normalizedEmail)) return genericResponse;

  const account = await prisma.userAccount.findUnique({ where: { email: normalizedEmail } });

  if (!account) {
    await logSecurityEvent(req, {
      eventType: EVENTS.PASSWORD_RESET_REQUESTED,
      outcome: OUTCOME.SUCCESS,
      severity: SEVERITY.INFO,
      message: "Password reset requested for an email address with no account.",
      actorEmail: normalizedEmail,
    });
    return genericResponse;
  }

  // Invalidate any earlier outstanding tokens for this account so a user cannot
  // accumulate live reset links.
  await prisma.passwordResetToken.updateMany({
    where: { accountId: account.id, isUsed: false },
    data: { isUsed: true },
  });

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  await prisma.passwordResetToken.create({
    data: {
      email: normalizedEmail,
      accountId: account.id,
      token: hashedToken, // only the hash is stored
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  const sent = await sendPasswordResetEmail(normalizedEmail, resetToken);
  if (!sent) {
    await prisma.passwordResetToken.deleteMany({ where: { token: hashedToken } });
    await logSecurityEvent(req, {
      eventType: EVENTS.PASSWORD_RESET_FAILURE,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.WARN,
      message: "Password reset delivery failed.",
      actorAccountId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
    });
  } else {
    await logSecurityEvent(req, {
      eventType: EVENTS.PASSWORD_RESET_REQUESTED,
      outcome: OUTCOME.SUCCESS,
      severity: SEVERITY.INFO,
      message: "Password reset email was accepted for delivery.",
      actorAccountId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
    });
  }

  // Deliberately the same response either way.
  return genericResponse;
};

const hashResetToken = (token) =>
  crypto.createHash("sha256").update(String(token ?? "").trim()).digest("hex");

/** Load a reset token and confirm it is still usable. */
const loadUsableToken = async (rawToken) => {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token: hashResetToken(rawToken) },
  });

  if (
    !record ||
    record.isUsed ||
    record.lockedAt !== null ||
    record.expiresAt < new Date() ||
    !record.accountId
  ) {
    // One message for every failure mode: expired, already used, burned by too
    // many wrong answers, or simply never existed.
    throw badRequest("This password reset link is no longer valid. Please request a new one.");
  }

  return record;
};

/**
 * Step 1 of the reset flow: exchange a valid token for the account's security
 * questions. Returns question TEXT only — never answers, and never the email,
 * which would confirm the address to whoever holds the link.
 */
export const verifyResetToken = async (rawToken) => {
  const record = await loadUsableToken(rawToken);
  const questions = await getQuestionsForAccount(record.accountId);

  return {
    questions,
    answersVerified: record.answersVerifiedAt !== null,
    attemptsRemaining: Math.max(0, config.securityAnswerMaxAttempts - record.answerAttempts),
  };
};

/**
 * Step 2: check the security answers. [2.1.9]
 *
 * A limited number of attempts, after which the token is burned — without this
 * the questions could be ground down offline-style by anyone holding a link.
 */
export const verifyResetAnswers = async ({ resetToken, answers }, req = null) => {
  const record = await loadUsableToken(resetToken);

  if (record.answerAttempts >= config.securityAnswerMaxAttempts) {
    await prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { lockedAt: new Date() },
    });
    throw badRequest("This password reset link is no longer valid. Please request a new one.");
  }

  const correct = await verifySecurityAnswers(record.accountId, answers);

  if (!correct) {
    const attemptedAt = new Date();
    const result = await prisma.$transaction(async (tx) => {
      // The predicate is re-evaluated after PostgreSQL acquires the row lock,
      // so concurrent wrong guesses increment independently instead of
      // overwriting one another with the same stale value.
      const claimed = await tx.passwordResetToken.updateMany({
        where: {
          id: record.id,
          accountId: record.accountId,
          isUsed: false,
          lockedAt: null,
          answersVerifiedAt: null,
          expiresAt: { gt: attemptedAt },
          answerAttempts: { lt: config.securityAnswerMaxAttempts },
        },
        data: { answerAttempts: { increment: 1 } },
      });
      if (claimed.count !== 1) return null;

      const latest = await tx.passwordResetToken.findUnique({ where: { id: record.id } });
      const exhausted = latest.answerAttempts >= config.securityAnswerMaxAttempts;
      if (exhausted) {
        await tx.passwordResetToken.update({
          where: { id: record.id },
          data: { lockedAt: attemptedAt },
        });
      }
      return { attempts: latest.answerAttempts, exhausted };
    });

    if (!result) {
      throw badRequest("This password reset link is no longer valid. Please request a new one.");
    }
    const { attempts, exhausted } = result;

    await logSecurityEvent(req, {
      eventType: EVENTS.SECURITY_ANSWER_FAILURE,
      outcome: OUTCOME.FAILURE,
      severity: exhausted ? SEVERITY.CRITICAL : SEVERITY.WARN,
      message: exhausted
        ? "Security answers failed too many times; the reset link was invalidated."
        : "Incorrect security answers during password reset.",
      actorAccountId: record.accountId,
      actorEmail: record.email,
      metadata: { attempts },
    });

    // One message whether one answer was wrong or both. Telling the user which
    // one they got right would halve the guessing effort.
    throw badRequest("Those answers are not correct.", {
      attemptsRemaining: Math.max(0, config.securityAnswerMaxAttempts - attempts),
    });
  }

  const verifiedAt = new Date();
  const marked = await prisma.passwordResetToken.updateMany({
    where: {
      id: record.id,
      accountId: record.accountId,
      isUsed: false,
      lockedAt: null,
      answersVerifiedAt: null,
      expiresAt: { gt: verifiedAt },
      answerAttempts: { lt: config.securityAnswerMaxAttempts },
    },
    data: { answersVerifiedAt: verifiedAt },
  });
  if (marked.count !== 1) {
    throw badRequest("This password reset link is no longer valid. Please request a new one.");
  }

  await logSecurityEvent(req, {
    eventType: EVENTS.SECURITY_ANSWER_SUCCESS,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: "Security answers verified during password reset.",
    actorAccountId: record.accountId,
    actorEmail: record.email,
  });

  return { message: "Answers verified. You can now choose a new password." };
};

/** Step 3: set the new password. Both factors must already be satisfied. */
export const resetPassword = async ({ resetToken, newPassword }, req = null) => {
  const record = await loadUsableToken(resetToken);

  if (!record.answersVerifiedAt) {
    await logSecurityEvent(req, {
      eventType: EVENTS.PASSWORD_RESET_FAILURE,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.WARN,
      message: "Password reset attempted without verifying the security answers first.",
      actorAccountId: record.accountId,
      actorEmail: record.email,
    });
    throw badRequest("Please answer your security questions before setting a new password.");
  }

  const account = await prisma.userAccount.findUnique({ where: { id: record.accountId } });
  if (!account) throw badRequest("This password reset link is no longer valid.");

  const profile = await loadProfile(account);

  const fail = async (eventType, message, details) => {
    await logSecurityEvent(req, {
      eventType,
      outcome: OUTCOME.FAILURE,
      severity: SEVERITY.INFO,
      message,
      actorAccountId: account.id,
      actorEmail: account.email,
      actorRole: account.role,
    });
    throw badRequest(message, details);
  };

  // The minimum-age rule applies here too [2.1.11]. If the reset flow skipped
  // it, anyone could sidestep the control by requesting a reset email instead
  // of using the change-password form — and the rule would protect nothing.
  const age = checkPasswordAge(account);
  if (!age.allowed) {
    await fail(EVENTS.PASSWORD_MIN_AGE_REJECTED, age.reason);
  }

  const policy = validatePassword(newPassword, {
    email: account.email,
    firstName: profile?.firstName,
    lastName: profile?.lastName ?? profile?.surname,
    orgName: profile?.orgName,
  });
  if (!policy.valid) {
    await fail(EVENTS.PASSWORD_RESET_FAILURE, "That password does not meet our requirements.", {
      failures: policy.failures,
    });
  }

  if (await isPasswordReused(account.id, newPassword)) {
    await fail(
      EVENTS.PASSWORD_REUSE_REJECTED,
      "This password has been used recently. Please choose a different one.",
    );
  }

  const passwordHash = await hashPassword(newPassword);
  const changedAt = new Date();
  const consumed = await prisma.$transaction(async (tx) => {
    // Claim this single-use token before changing the password. A concurrent
    // reset can no longer pass the earlier read and apply a second password;
    // any failure below rolls this claim back with the password write.
    const claim = await tx.passwordResetToken.updateMany({
      where: {
        id: record.id,
        accountId: account.id,
        isUsed: false,
        lockedAt: null,
        answersVerifiedAt: { not: null },
        expiresAt: { gt: changedAt },
      },
      data: { isUsed: true },
    });
    if (claim.count !== 1) return false;

    await applyPreparedPassword(tx, account.id, passwordHash, changedAt);
    return true;
  });

  if (!consumed) {
    await fail(
      EVENTS.PASSWORD_RESET_FAILURE,
      "This password reset link is no longer valid. Please request a new one.",
    );
  }

  await logSecurityEvent(req, {
    eventType: EVENTS.PASSWORD_RESET_SUCCESS,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: "Password reset completed; all sessions were invalidated.",
    actorAccountId: account.id,
    actorEmail: account.email,
    actorRole: account.role,
  });

  return { message: "Your password has been reset. You can now sign in." };
};

/* ═══════════════════════════════════════════════════════════════════════════
 * SECURITY QUESTIONS (self-service)
 * ═══════════════════════════════════════════════════════════════════════════ */

export const updateSecurityAnswers = async (accountId, securityAnswers, req = null) => {
  const check = validateAnswerSet(securityAnswers, config.securityQuestionCount);
  if (!check.valid) {
    throw badRequest("Please complete your security questions.", { failures: check.failures });
  }

  await setSecurityAnswers(accountId, securityAnswers);

  await logSecurityEvent(req, {
    eventType: EVENTS.SECURITY_QUESTIONS_SET,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: "Security questions were updated.",
    actorAccountId: accountId,
  });

  return { message: "Your security questions have been saved." };
};

/* ═══════════════════════════════════════════════════════════════════════════
 * ORGANIZATION APPROVAL (used by the admin panel)
 * ═══════════════════════════════════════════════════════════════════════════ */

export const getPendingNgoUsers = async () => {
  const orgs = await prisma.organization.findMany({
    where: { status: "Pending" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      accountId: true,
      orgName: true,
      firstName: true,
      surname: true,
      email: true,
      country: true,
      bio: true,
      status: true,
      isVerified: true,
      createdAt: true,
    },
  });
  return orgs;
};

/**
 * Approving an organization flips BOTH the profile row and the UserAccount that
 * actually governs sign-in. Updating only the profile — as the previous version
 * did — would have left the account unable to log in after approval.
 */
export const updateNgoApproval = async (organizationId, action, req = null) => {
  const approve = action === "approve";

  const result = await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        accountId: true,
        orgName: true,
        email: true,
        status: true,
        account: { select: { status: true } },
      },
    });
    if (!organization) return null;

    if (organization.status !== "Pending" || organization.account.status !== "Pending") {
      throw conflict("This organization registration has already been reviewed.");
    }

    // Conditional updates make a second concurrent review fail with 409 after
    // the first transaction changes either Pending state.
    const profileUpdate = await tx.organization.updateMany({
      where: { id: organizationId, status: "Pending" },
      data: { status: approve ? "Approved" : "Rejected", isVerified: approve },
    });
    const accountUpdate = await tx.userAccount.updateMany({
      where: { id: organization.accountId, status: "Pending" },
      data: {
        status: approve ? "Active" : "Rejected",
        // A rejected organization's outstanding sessions die immediately.
        ...(approve ? {} : { tokenVersion: { increment: 1 } }),
      },
    });

    if (profileUpdate.count !== 1 || accountUpdate.count !== 1) {
      throw conflict("This organization registration has already been reviewed.");
    }

    const updated = await tx.organization.findUnique({ where: { id: organizationId } });
    return { organization, updated };
  });

  if (!result) return null;
  const { organization, updated } = result;

  await logSecurityEvent(req, {
    eventType: approve ? EVENTS.ACCOUNT_APPROVED : EVENTS.ACCOUNT_REJECTED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.INFO,
    message: `Organization "${organization.orgName}" was ${approve ? "approved" : "rejected"}.`,
    targetType: "Organization",
    targetId: organizationId,
    metadata: { organizationEmail: organization.email },
  });

  return updated;
};

export default {
  seedDefaultUsers,
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  reauthenticate,
  changePassword,
  requestPasswordReset,
  verifyResetToken,
  verifyResetAnswers,
  resetPassword,
  updateSecurityAnswers,
  getPendingNgoUsers,
  updateNgoApproval,
};
