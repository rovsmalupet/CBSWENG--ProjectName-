/**
 * adminUserController.js — administrator account management.
 *
 * Implements the Part 1 CRUD requirements that did not exist at all before:
 * "Add new Administrator and Role A accounts" and "Assign/Change user roles for
 * Administrator and Role A".
 *
 * Every route here requires the `admin` role AND a fresh re-authentication,
 * both declared in security/accessControl.js. [CSSECDV 2.1.13]
 *
 * Two safety interlocks, neither of them about privacy:
 *   · an administrator cannot act on their own account (owners.notSelfAccount);
 *   · the last remaining administrator cannot be demoted or disabled.
 * Losing every administrator is unrecoverable through the application, because
 * no route can create one without already being one.
 */

import crypto from "crypto";

import prisma from "../prisma/client.js";
import { AppError, notFound, conflict } from "../errors/AppError.js";
import { hashPassword, validatePassword } from "../security/passwordPolicy.js";
import { assertNotLastAdmin, assertAssignableRole } from "../security/businessRules.js";
import { logSecurityEvent, EVENTS, OUTCOME, SEVERITY } from "../security/securityLog.js";

const countActiveAdmins = () =>
  prisma.userAccount.count({ where: { role: "admin", status: "Active" } });

/**
 * A random password that satisfies the policy by construction.
 *
 * Shown to the administrator exactly once, in the response, and never stored in
 * readable form. The account is flagged `mustChangePassword`, so the owner
 * replaces it at first sign-in — and that flag also lets them do so immediately
 * rather than waiting out the 24-hour minimum age. [2.1.11]
 */
const generateTemporaryPassword = () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const candidate = `Bh-${crypto.randomBytes(12).toString("base64url")}-7a!`;
    if (validatePassword(candidate).valid) return candidate;
  }
  // base64url output occasionally lacks a required class; the suffix normally
  // covers it, so this is only a guard against an unlucky run.
  return `Bh-${crypto.randomBytes(12).toString("hex")}-Qz9!`;
};

/** GET /admin/users */
export const listUsers = async (req, res) => {
  const { role, status, search } = req.validated.query;
  const page = Number(req.validated.query.page ?? 1);
  const limit = Math.min(Number(req.validated.query.limit ?? 25), 100);

  const where = {
    ...(role ? { role } : {}),
    ...(status ? { status } : {}),
    ...(search ? { email: { contains: search.toLowerCase(), mode: "insensitive" } } : {}),
  };

  const [total, accounts] = await Promise.all([
    prisma.userAccount.count({ where }),
    prisma.userAccount.findMany({
      where,
      orderBy: [{ role: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
      // passwordHash is never selected. Not because it would be readable, but
      // because a hash that never leaves the database cannot be cracked offline.
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        failedLoginAttempts: true,
        lockedUntil: true,
        mustChangePassword: true,
        passwordChangedAt: true,
        lastLoginAt: true,
        createdAt: true,
        admin: { select: { id: true, firstName: true, lastName: true } },
        donor: { select: { id: true, firstName: true, lastName: true } },
        organization: { select: { id: true, orgName: true, firstName: true, surname: true } },
      },
    }),
  ]);

  const now = new Date();
  res.json({
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    users: accounts.map((account) => ({
      id: account.id,
      email: account.email,
      role: account.role,
      status: account.status,
      isLocked: Boolean(account.lockedUntil && account.lockedUntil > now),
      lockedUntil: account.lockedUntil,
      failedLoginAttempts: account.failedLoginAttempts,
      mustChangePassword: account.mustChangePassword,
      passwordChangedAt: account.passwordChangedAt,
      lastLoginAt: account.lastLoginAt,
      createdAt: account.createdAt,
      displayName:
        account.organization?.orgName ??
        [account.admin?.firstName ?? account.donor?.firstName, account.admin?.lastName ?? account.donor?.lastName]
          .filter(Boolean)
          .join(" ") ??
        account.email,
      profileId: account.admin?.id ?? account.donor?.id ?? account.organization?.id ?? null,
    })),
  });
};

/** POST /admin/users — create an administrator or organization account. */
export const createUser = async (req, res) => {
  const { email, role, firstName, lastName, orgName, country } = req.body;

  // Donors self-register. Enforced here as well as in the schema so the rule
  // survives an edit to either.
  assertAssignableRole(role);

  const existing = await prisma.userAccount.findUnique({ where: { email } });
  if (existing) throw conflict("An account already exists for that email address.");

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  const account = await prisma.$transaction(async (tx) => {
    const created = await tx.userAccount.create({
      data: {
        email,
        passwordHash,
        role,
        status: "Active",
        mustChangePassword: true,
        ...(role === "admin"
          ? { admin: { create: { firstName, lastName, email } } }
          : {
              organization: {
                create: {
                  orgName,
                  firstName,
                  surname: lastName,
                  email,
                  country: country ?? "Philippines",
                  // Provisioned by an administrator, so already trusted.
                  isVerified: true,
                  status: "Approved",
                },
              },
            }),
      },
    });

    await tx.passwordHistory.create({ data: { accountId: created.id, passwordHash } });
    return created;
  });

  await logSecurityEvent(req, {
    eventType: EVENTS.USER_CREATED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.CRITICAL,
    message: `A new ${role} account was created for ${email}.`,
    targetType: "UserAccount",
    targetId: account.id,
    metadata: { role, email },
  });

  res.status(201).json({
    message: "Account created.",
    user: { id: account.id, email: account.email, role: account.role },
    // Shown once. The new user must set their own password at first sign-in,
    // and their security questions with it.
    temporaryPassword,
    notice:
      "Give this password to the account holder through a channel other than email. They will be required to change it when they first sign in.",
  });
};

/** PATCH /admin/users/:id/role */
export const changeUserRole = async (req, res) => {
  const target = req.resource; // loaded by owners.notSelfAccount
  const { role } = req.body;

  assertAssignableRole(role);

  if (target.role === role) {
    throw conflict("That account already has this role.");
  }
  // A donor's role cannot be changed: donor and organization profiles hold
  // different columns, and the profile row would have to be rebuilt.
  if (target.role === "donor") {
    throw new AppError(
      "Donor accounts cannot be converted to another role.",
      409,
      "ROLE_NOT_CONVERTIBLE",
    );
  }
  if (role !== "admin") {
    assertNotLastAdmin(await countActiveAdmins(), target.role === "admin");
  }

  await prisma.userAccount.update({
    where: { id: target.id },
    // The version bump signs the account out everywhere at once, so a user who
    // has just lost administrator rights cannot keep using a token that still
    // claims them.
    data: { role, tokenVersion: { increment: 1 } },
  });

  await logSecurityEvent(req, {
    eventType: EVENTS.USER_ROLE_CHANGED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.CRITICAL,
    message: `Role for ${target.email} changed from ${target.role} to ${role}.`,
    targetType: "UserAccount",
    targetId: target.id,
    metadata: { from: target.role, to: role, email: target.email },
  });

  res.json({ message: "Role updated. The user has been signed out of all sessions." });
};

/**
 * DELETE /admin/users/:id
 *
 * A soft delete. A hard delete would cascade through projects, contributions,
 * payments, and refunds, destroying financial history and the audit trail of
 * what the account did — the opposite of what an audit requirement wants.
 */
export const disableUser = async (req, res) => {
  const target = req.resource;

  if (target.status === "Disabled") throw conflict("That account is already disabled.");
  assertNotLastAdmin(await countActiveAdmins(), target.role === "admin");

  await prisma.userAccount.update({
    where: { id: target.id },
    data: { status: "Disabled", tokenVersion: { increment: 1 } },
  });

  await logSecurityEvent(req, {
    eventType: EVENTS.USER_DELETED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.CRITICAL,
    message: `Account ${target.email} was disabled.`,
    targetType: "UserAccount",
    targetId: target.id,
    metadata: { role: target.role, email: target.email },
  });

  res.json({ message: "Account disabled and signed out everywhere." });
};

/**
 * POST /admin/users/:id/unlock
 *
 * The recovery path for lockout [2.1.8]. Without it, a user locked out by an
 * attacker's failed guesses would simply have to wait — and an administrator
 * would have no way to help.
 */
export const unlockUser = async (req, res) => {
  const target = req.resource;

  await prisma.userAccount.update({
    where: { id: target.id },
    data: { lockedUntil: null, failedLoginAttempts: 0 },
  });

  await logSecurityEvent(req, {
    eventType: EVENTS.ACCOUNT_UNLOCKED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.WARN,
    message: `Account ${target.email} was unlocked by an administrator.`,
    targetType: "UserAccount",
    targetId: target.id,
  });

  res.json({ message: "Account unlocked." });
};

/**
 * POST /admin/users/:id/force-reset
 *
 * Note what an administrator can and cannot do: they may force a reset, and
 * they may hand over a one-time password. They cannot read an existing password
 * and cannot choose a lasting one for someone else.
 */
export const forcePasswordReset = async (req, res) => {
  const target = req.resource;

  const temporaryPassword = generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  await prisma.$transaction(async (tx) => {
    await tx.userAccount.update({
      where: { id: target.id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
        // Lets the owner set their own password straight away instead of being
        // blocked by the minimum-age rule the reset itself just triggered.
        mustChangePassword: true,
        tokenVersion: { increment: 1 },
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });
    await tx.passwordHistory.create({ data: { accountId: target.id, passwordHash } });
  });

  await logSecurityEvent(req, {
    eventType: EVENTS.PASSWORD_RESET_REQUESTED,
    outcome: OUTCOME.SUCCESS,
    severity: SEVERITY.CRITICAL,
    message: `An administrator forced a password reset for ${target.email}.`,
    targetType: "UserAccount",
    targetId: target.id,
  });

  res.json({
    message: "A temporary password has been set and all sessions were signed out.",
    temporaryPassword,
    notice:
      "Give this password to the account holder through a channel other than email. They will be required to change it when they next sign in.",
  });
};
