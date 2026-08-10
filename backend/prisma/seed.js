/**
 * seed.js — demo data for the CSSECDV machine project.
 *
 * Every account and fixture below exists to make a specific checklist item
 * demonstrable; the comment on each says which.
 *
 * Two deliberate departures from the previous seed:
 *
 *  · NO HARDCODED PASSWORDS. The old file contained "admin123", "donor123",
 *    "redcross123" and a dozen more in source control, and printed them to the
 *    console as a "quick login reference". Every one fails the current policy.
 *    Passwords now come from the environment, or are generated and shown once.
 *
 *  · PASSWORD AGES ARE BACKDATED. The minimum-age rule [2.1.11] refuses a
 *    change within 24 hours of the previous one. Without a backdated
 *    `passwordChangedAt`, every freshly seeded account would refuse a password
 *    change and the control could only ever be demonstrated failing.
 *
 * Run with:  npm run db:seed
 */

import crypto from "crypto";

import prisma from "./client.js";
import { hashPassword, validatePassword } from "../security/passwordPolicy.js";
import { setSecurityAnswers } from "../security/securityQuestions.js";

/* ═══════════════════════════════════════════════════════════════════════════
 * PASSWORDS
 * ═══════════════════════════════════════════════════════════════════════════ */

const generated = [];

/**
 * Take a password from the environment, or generate one that satisfies the
 * policy. Generated values are printed once at the end and stored nowhere.
 */
const resolvePassword = (envKey, label) => {
  const fromEnv = process.env[envKey]?.trim();
  if (fromEnv) {
    const check = validatePassword(fromEnv);
    if (!check.valid) {
      throw new Error(
        `${envKey} does not satisfy the password policy:\n    ${check.failures.join("\n    ")}`,
      );
    }
    return fromEnv;
  }

  // Shaped to satisfy every rule: upper, lower, digit, symbol, 12–64
  // characters, and not derived from any common word.
  const password = `Bh-${crypto.randomBytes(9).toString("base64url")}-4x!`;
  generated.push({ label, password });
  return password;
};

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60 * 1000);
const daysAhead = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

/** Two answers, so every seeded account can exercise the reset flow. */
const DEFAULT_ANSWERS = [
  { questionKey: "street_age_ten", answer: "Mapagmahal Street" },
  { questionKey: "first_concert", answer: "Eraserheads at Cubao Expo" },
];

/**
 * Create a UserAccount together with its profile row, password-history entry
 * and security answers — in one place, so no seeded account is half-built.
 */
const createAccount = async ({
  email,
  role,
  password,
  status = "Active",
  profile,
  passwordAgeDays = 30,
  mustChangePassword = false,
  lockout = null,
  lastAccess = null,
}) => {
  const passwordHash = await hashPassword(password);

  const account = await prisma.userAccount.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      role,
      status,
      mustChangePassword,
      passwordChangedAt: daysAgo(passwordAgeDays),
      createdAt: daysAgo(Math.max(passwordAgeDays, 30)),
      ...(lockout ?? {}),
      ...(lastAccess ?? {}),
      ...(role === "admin" ? { admin: { create: profile } } : {}),
      ...(role === "donor" ? { donor: { create: profile } } : {}),
      ...(role === "ngo" ? { organization: { create: profile } } : {}),
    },
  });

  await prisma.passwordHistory.create({
    data: { accountId: account.id, passwordHash, createdAt: daysAgo(passwordAgeDays) },
  });

  await setSecurityAnswers(account.id, DEFAULT_ANSWERS);

  return account;
};

const profileIdFor = async (account) => {
  if (account.role === "admin") {
    return (await prisma.admin.findUnique({ where: { accountId: account.id } })).id;
  }
  if (account.role === "donor") {
    return (await prisma.donor.findUnique({ where: { accountId: account.id } })).id;
  }
  return (await prisma.organization.findUnique({ where: { accountId: account.id } })).id;
};

/* ═══════════════════════════════════════════════════════════════════════════
 * MAIN
 * ═══════════════════════════════════════════════════════════════════════════ */

async function main() {
  console.log("\n  Seeding CSSECDV demo data…\n");

  // Idempotent: wipe and rebuild. Deleting UserAccount cascades to the profile
  // tables, which cascade to posts, contributions, payments and refunds.
  await prisma.securityLog.deleteMany({});
  await prisma.userAccount.deleteMany({});
  console.log("  · cleared existing accounts and their data");

  /* ── 1.1.1  Website Administrator ─────────────────────────────────────── */
  const adminAccount = await createAccount({
    email: "admin@bayanihub.local",
    role: "admin",
    password: resolvePassword("SEED_ADMIN_PASSWORD", "Website Administrator"),
    profile: { firstName: "Sofia", lastName: "Reyes", email: "admin@bayanihub.local" },
    passwordAgeDays: 45,
  });

  /**
   * A second administrator. An admin cannot act on their own account, so
   * without a second one the role-change and disable flows have no target.
   * Also makes the "last remaining administrator" interlock demonstrable.
   */
  await createAccount({
    email: "second.admin@bayanihub.local",
    role: "admin",
    password: resolvePassword("SEED_ADMIN2_PASSWORD", "Second Administrator"),
    profile: { firstName: "Miguel", lastName: "Bautista", email: "second.admin@bayanihub.local" },
    passwordAgeDays: 40,
  });

  /* ── 1.1.2  Product Manager (Role A — organization) ───────────────────── */
  const redCross = await createAccount({
    email: "mary.angela@redcross.ph",
    role: "ngo",
    password: resolvePassword("SEED_NGO_PASSWORD", "Product Manager / NGO"),
    profile: {
      orgName: "Philippine Red Cross",
      firstName: "Mary Angela",
      surname: "Cruz",
      email: "mary.angela@redcross.ph",
      country: "Philippines",
      bio: "Humanitarian response, blood services and disaster preparedness across the Philippines.",
      isVerified: true,
      status: "Approved",
    },
    passwordAgeDays: 35,
    lastAccess: {
      // [2.1.12] A previous successful sign-in AND three failed attempts since,
      // so the warning row of the last-access banner is populated on first login.
      lastLoginAt: daysAgo(2),
      lastLoginIp: "112.200.14.7",
      lastFailedLoginAt: minutesAgo(90),
      lastFailedLoginIp: "203.0.113.44",
      failedAttemptsSinceLogin: 3,
    },
  });

  /**
   * A SECOND organization, with its own projects. [2.2.2]
   * Without two organizations there is no way to show a cross-tenant access
   * attempt being refused.
   */
  const actionAid = await createAccount({
    email: "juan.santos@actionaid.ph",
    role: "ngo",
    password: resolvePassword("SEED_NGO2_PASSWORD", "Second NGO (access-control demo)"),
    profile: {
      orgName: "Action Aid Philippines",
      firstName: "Juan",
      surname: "Santos",
      email: "juan.santos@actionaid.ph",
      country: "Philippines",
      bio: "Rights-based development work with underserved communities.",
      isVerified: true,
      status: "Approved",
    },
    passwordAgeDays: 28,
  });

  const greenEarth = await createAccount({
    email: "rosa.garcia@greenearth.ph",
    role: "ngo",
    password: resolvePassword("SEED_NGO3_PASSWORD", "Third NGO"),
    profile: {
      orgName: "Green Earth Foundation",
      firstName: "Rosa",
      surname: "Garcia",
      email: "rosa.garcia@greenearth.ph",
      country: "Philippines",
      bio: "Reforestation, coastal restoration and climate resilience.",
      isVerified: true,
      status: "Approved",
    },
    passwordAgeDays: 26,
  });

  const seaCare = await createAccount({
    email: "david.lim@seacare.sg",
    role: "ngo",
    password: resolvePassword("SEED_NGO4_PASSWORD", "Singapore NGO"),
    profile: {
      orgName: "SeaCare Foundation Singapore",
      firstName: "David",
      surname: "Lim",
      email: "david.lim@seacare.sg",
      country: "Singapore",
      bio: "Marine ecosystem protection across Southeast Asia.",
      isVerified: true,
      status: "Approved",
    },
    passwordAgeDays: 24,
  });

  /**
   * An organization still awaiting approval. [2.1.4]
   * Signing in with the CORRECT password still returns the same generic
   * failure, because the account's state is not disclosed to an anonymous
   * caller.
   */
  await createAccount({
    email: "pending.org@bayanihub.local",
    role: "ngo",
    password: resolvePassword("SEED_PENDING_NGO_PASSWORD", "Pending NGO (cannot sign in yet)"),
    status: "Pending",
    profile: {
      orgName: "Bagong Simula Community Trust",
      firstName: "Teresa",
      surname: "Lim",
      email: "pending.org@bayanihub.local",
      country: "Philippines",
      bio: "Awaiting administrator review.",
      isVerified: false,
      status: "Pending",
    },
    passwordAgeDays: 1,
  });

  /* ── 1.1.3  Customer (Role B — donor) ─────────────────────────────────── */
  const donor = await createAccount({
    email: "donor@bayanihub.local",
    role: "donor",
    password: resolvePassword("SEED_DONOR_PASSWORD", "Customer / Donor"),
    profile: {
      firstName: "Andrea",
      lastName: "Villanueva",
      email: "donor@bayanihub.local",
      country: "Philippines",
      affiliation: "Virtual Champions PH",
      bio: "Supporting education and disaster response.",
      isVerified: true,
      status: "Approved",
    },
    passwordAgeDays: 20,
    lastAccess: { lastLoginAt: daysAgo(5), lastLoginIp: "112.200.9.31" },
  });

  await createAccount({
    email: "margaret.lim@corporate.com",
    role: "donor",
    password: resolvePassword("SEED_DONOR2_PASSWORD", "Second Donor"),
    profile: {
      firstName: "Margaret",
      lastName: "Lim",
      email: "margaret.lim@corporate.com",
      country: "Philippines",
      affiliation: "Tech Solutions Inc",
      isVerified: true,
      status: "Approved",
    },
    passwordAgeDays: 18,
  });

  /* ── Security-control fixtures ────────────────────────────────────────── */

  /**
   * An account that is ALREADY locked. [2.1.8]
   * Lets the locked state be shown immediately without first failing five
   * sign-ins, and gives the administrator's unlock button a target.
   */
  await createAccount({
    email: "locked@bayanihub.local",
    role: "donor",
    password: resolvePassword("SEED_LOCKED_PASSWORD", "Locked account (lockout demo)"),
    profile: {
      firstName: "Lorenzo",
      lastName: "Aquino",
      email: "locked@bayanihub.local",
      country: "Philippines",
      affiliation: "Locked Account Demo",
      isVerified: true,
      status: "Approved",
    },
    passwordAgeDays: 15,
    lockout: {
      failedLoginAttempts: 5,
      lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
    },
    lastAccess: {
      lastFailedLoginAt: minutesAgo(2),
      lastFailedLoginIp: "203.0.113.44",
      failedAttemptsSinceLogin: 5,
    },
  });

  /**
   * An account whose password was set TODAY. [2.1.11]
   * Demonstrates the minimum-age rule refusing a change. Every other account is
   * backdated, so they demonstrate the same rule permitting one.
   */
  await createAccount({
    email: "freshpw@bayanihub.local",
    role: "donor",
    password: resolvePassword("SEED_FRESHPW_PASSWORD", "Fresh-password account (min-age demo)"),
    profile: {
      firstName: "Bea",
      lastName: "Salonga",
      email: "freshpw@bayanihub.local",
      country: "Philippines",
      affiliation: "Password Age Demo",
      isVerified: true,
      status: "Approved",
    },
    passwordAgeDays: 0,
  });

  console.log("  · created 11 accounts");

  /* ═════════════════════════════════════════════════════════════════════════
   * PROJECTS
   * ═══════════════════════════════════════════════════════════════════════ */

  const redCrossId = await profileIdFor(redCross);
  const actionAidId = await profileIdFor(actionAid);
  const greenEarthId = await profileIdFor(greenEarth);
  const seaCareId = await profileIdFor(seaCare);
  const donorId = await profileIdFor(donor);

  const budget = [
    { label: "Programme delivery", percentage: 70 },
    { label: "Logistics", percentage: 20 },
    { label: "Operations", percentage: 10 },
  ];

  const makePost = (orgId, data) =>
    prisma.post.create({ data: { orgId, budgetBreakdown: budget, ...data } });

  const medicalMission = await makePost(redCrossId, {
    projectName: "Community Medical Mission",
    description: "Free medical checkups and health awareness for underserved barangays in Manila.",
    causes: ["goodHealth", "sustainableCities"],
    location: "Manila",
    priority: "High",
    overallStatus: "Approved",
    endDate: daysAhead(60),
    supportOptions: {
      create: [
        { type: "Monetary", targetAmount: 50000, currentAmount: 0 },
        { type: "Volunteer", targetCount: 20, currentCount: 0 },
      ],
    },
    inKindItems: {
      create: [
        { itemName: "Medical Supplies", targetQuantity: 100, unit: "boxes", pricePerUnit: 450 },
      ],
    },
  });

  const typhoonDrive = await makePost(redCrossId, {
    projectName: "Batangas Typhoon Relief Drive",
    description: "Food, water and clothing for families displaced by the Batangas typhoon.",
    causes: ["noPoverty", "zeroHunger"],
    location: "Batangas",
    priority: "High",
    overallStatus: "Approved",
    startDate: daysAgo(5),
    endDate: daysAhead(30),
    supportOptions: { create: [{ type: "Monetary", targetAmount: 80000, currentAmount: 0 }] },
    inKindItems: {
      create: [
        { itemName: "1kg Rice", targetQuantity: 250, unit: "bags", pricePerUnit: 55 },
        { itemName: "Canned Tuna 150g", targetQuantity: 250, unit: "pieces", pricePerUnit: 32 },
        { itemName: "Drinking Water 1L", targetQuantity: 400, unit: "bottles", pricePerUnit: 20 },
      ],
    },
  });

  /**
   * A project that is NOT approved. [2.2.2]
   * A donor requesting it by id receives 404, and it never appears in the
   * public feed — previously any signed-in user could read it.
   */
  await makePost(redCrossId, {
    projectName: "Clean Water Initiative (draft)",
    description: "Water wells for rural Mindanao. Not yet submitted for review.",
    causes: ["cleanWater"],
    location: "Mindanao",
    priority: "Medium",
    overallStatus: "Pending",
    supportOptions: { create: [{ type: "Monetary", targetAmount: 75000, currentAmount: 0 }] },
  });

  /**
   * Deleted is terminal. [2.2.3]
   * An attempt to move this back to Approved is refused by the state machine.
   */
  await makePost(redCrossId, {
    projectName: "Cancelled Book Drive",
    description: "Withdrawn by the organization.",
    causes: ["qualityEducation"],
    location: "Quezon City",
    priority: "Low",
    overallStatus: "Deleted",
    supportOptions: { create: [{ type: "Monetary", targetAmount: 10000, currentAmount: 0 }] },
  });

  /**
   * Belongs to a DIFFERENT organization. [2.2.2]
   * Signed in as Philippine Red Cross, attempting to edit or delete this must
   * be refused — it was not, before the ownership resolvers existed.
   */
  const educationProject = await makePost(actionAidId, {
    projectName: "Rights-Based Education for Children",
    description: "Quality education and life-skills training for 500 children in Valenzuela.",
    causes: ["qualityEducation", "noPoverty"],
    location: "Valenzuela",
    priority: "High",
    overallStatus: "Approved",
    endDate: daysAhead(120),
    supportOptions: { create: [{ type: "Monetary", targetAmount: 100000, currentAmount: 0 }] },
  });

  await makePost(actionAidId, {
    projectName: "Women's Livelihood and Empowerment",
    description: "Training and microfinance support for 200 women entrepreneurs in Cebu.",
    causes: ["genderEquality", "noPoverty"],
    location: "Cebu",
    priority: "High",
    overallStatus: "Approved",
    supportOptions: {
      create: [
        { type: "Monetary", targetAmount: 150000, currentAmount: 0 },
        { type: "Volunteer", targetCount: 15, currentCount: 0 },
      ],
    },
  });

  /** An unapproved project cannot receive contributions. [2.2.3] */
  await makePost(actionAidId, {
    projectName: "Nutrition Programme (returned for revision)",
    description: "Returned by an administrator for revision.",
    causes: ["goodHealth", "zeroHunger"],
    location: "Samar",
    priority: "High",
    overallStatus: "Unapproved",
    supportOptions: { create: [{ type: "Monetary", targetAmount: 80000, currentAmount: 0 }] },
  });

  const mangroveProject = await makePost(greenEarthId, {
    projectName: "Mangrove Reforestation Project",
    description: "Plant and maintain 10,000 mangroves to restore coastal ecosystems in Laguna.",
    causes: ["climateAction", "lifeBelowWater"],
    location: "Laguna",
    priority: "High",
    overallStatus: "Approved",
    endDate: daysAhead(200),
    supportOptions: {
      create: [
        { type: "Monetary", targetAmount: 200000, currentAmount: 0 },
        { type: "Volunteer", targetCount: 100, currentCount: 0 },
      ],
    },
    inKindItems: {
      create: [
        { itemName: "Mangrove Propagules", targetQuantity: 10000, unit: "pieces", pricePerUnit: 12 },
      ],
    },
  });

  await makePost(greenEarthId, {
    projectName: "Zero Waste Community Programme",
    description: "Waste segregation and recycling systems for five barangays in Cavite.",
    causes: ["responsibleConsumption", "sustainableCities"],
    location: "Cavite",
    priority: "Medium",
    overallStatus: "Approved",
    supportOptions: { create: [{ type: "Volunteer", targetCount: 60, currentCount: 0 }] },
    inKindItems: {
      create: [
        { itemName: "Recycling Bins", targetQuantity: 500, unit: "pieces", pricePerUnit: 380 },
      ],
    },
  });

  await makePost(seaCareId, {
    projectName: "Coral Reef Restoration",
    description: "Restoring coral reefs and mangrove ecosystems around Singapore.",
    causes: ["lifeBelowWater", "climateAction"],
    location: "Singapore",
    priority: "High",
    overallStatus: "Approved",
    supportOptions: {
      create: [
        { type: "Monetary", targetAmount: 200000, currentAmount: 0 },
        { type: "Volunteer", targetCount: 75, currentCount: 0 },
      ],
    },
  });

  console.log("  · created 10 projects across 4 organizations");

  /* ═════════════════════════════════════════════════════════════════════════
   * CONTRIBUTIONS
   *
   * A mix of Pending and Confirmed. Only the CONFIRMED ones have moved the
   * project totals — a pending contribution contributes nothing to a progress
   * bar until the receiving organization agrees. [2.2.3]
   * ═══════════════════════════════════════════════════════════════════════ */

  const partnership = await prisma.donorOrganizationPartner.create({
    data: { donorId, orgId: redCrossId, status: "approved" },
  });

  await prisma.contribution.create({
    data: {
      donorName: "Andrea Villanueva",
      partnershipId: partnership.id,
      postId: medicalMission.id,
      type: "Monetary",
      amount: 5000,
      status: "Confirmed",
      statusChangedAt: daysAgo(3),
      statusChangedBy: redCrossId,
      createdAt: daysAgo(4),
    },
  });
  await prisma.postSupportOption.updateMany({
    where: { postId: medicalMission.id, type: "Monetary" },
    data: { currentAmount: { increment: 5000 } },
  });

  /** Awaiting confirmation — deliberately has NOT moved the totals. [2.2.3] */
  await prisma.contribution.create({
    data: {
      donorName: "Andrea Villanueva",
      partnershipId: partnership.id,
      postId: typhoonDrive.id,
      type: "Monetary",
      amount: 2500,
      status: "Pending",
      createdAt: daysAgo(1),
    },
  });

  await prisma.contribution.create({
    data: {
      donorName: "Margaret Lim",
      postId: educationProject.id,
      type: "Monetary",
      amount: 12000,
      status: "Confirmed",
      statusChangedAt: daysAgo(6),
      statusChangedBy: actionAidId,
      createdAt: daysAgo(7),
    },
  });
  await prisma.postSupportOption.updateMany({
    where: { postId: educationProject.id, type: "Monetary" },
    data: { currentAmount: { increment: 12000 } },
  });

  await prisma.contribution.create({
    data: {
      donorName: "Walk-in volunteer group",
      postId: mangroveProject.id,
      type: "Volunteer",
      volunteerCount: 12,
      status: "Confirmed",
      statusChangedAt: daysAgo(2),
      statusChangedBy: greenEarthId,
      createdAt: daysAgo(2),
    },
  });
  await prisma.postSupportOption.updateMany({
    where: { postId: mangroveProject.id, type: "Volunteer" },
    data: { currentCount: { increment: 12 } },
  });

  console.log("  · created 4 contributions (3 confirmed, 1 awaiting confirmation)");

  /* ═════════════════════════════════════════════════════════════════════════
   * SECURITY LOG HISTORY  [2.4.3, 2.4.4]
   *
   * A populated log, so the administrator's viewer has something to filter on
   * day one. Every event family appears with BOTH a success and a failure, and
   * all three severities are represented — the filters can then be shown doing
   * real work rather than returning an empty table.
   * ═══════════════════════════════════════════════════════════════════════ */

  const logEntries = [
    // Authentication
    { h: 72, t: "LOGIN_SUCCESS", o: "SUCCESS", s: "INFO", e: "mary.angela@redcross.ph", r: "ngo", ip: "112.200.14.7", m: "Successful sign-in." },
    { h: 70, t: "LOGIN_SUCCESS", o: "SUCCESS", s: "INFO", e: "donor@bayanihub.local", r: "donor", ip: "112.200.9.31", m: "Successful sign-in." },
    { h: 26, t: "LOGIN_FAILURE", o: "FAILURE", s: "WARN", e: "mary.angela@redcross.ph", r: "ngo", ip: "203.0.113.44", m: "Failed sign-in attempt (bad_password). 1 of 5 before lockout." },
    { h: 26, t: "LOGIN_FAILURE", o: "FAILURE", s: "WARN", e: "mary.angela@redcross.ph", r: "ngo", ip: "203.0.113.44", m: "Failed sign-in attempt (bad_password). 2 of 5 before lockout." },
    { h: 25, t: "LOGIN_FAILURE", o: "FAILURE", s: "WARN", e: "mary.angela@redcross.ph", r: "ngo", ip: "203.0.113.44", m: "Failed sign-in attempt (bad_password). 3 of 5 before lockout." },
    { h: 20, t: "LOGIN_FAILURE", o: "FAILURE", s: "WARN", e: "no.such.user@example.com", ip: "198.51.100.9", m: "Failed sign-in attempt for an email address with no account." },
    { h: 6, t: "LOGIN_FAILURE", o: "FAILURE", s: "WARN", e: "locked@bayanihub.local", r: "donor", ip: "203.0.113.44", m: "Failed sign-in attempt (bad_password). 5 of 5 before lockout." },
    { h: 6, t: "ACCOUNT_LOCKED", o: "FAILURE", s: "CRITICAL", e: "locked@bayanihub.local", r: "donor", ip: "203.0.113.44", m: "Account locked for 15 minutes after 5 failed sign-in attempts." },
    { h: 5, t: "LOGOUT", o: "SUCCESS", s: "INFO", e: "donor@bayanihub.local", r: "donor", ip: "112.200.9.31", m: "Signed out; all sessions for this account were invalidated." },

    // Registration
    { h: 48, t: "REGISTRATION_SUCCESS", o: "SUCCESS", s: "INFO", e: "margaret.lim@corporate.com", r: "donor", ip: "112.200.3.18", m: "New donor account registered." },
    { h: 30, t: "REGISTRATION_FAILURE", o: "FAILURE", s: "INFO", e: "weakpass@example.com", ip: "198.51.100.22", m: "Registration rejected: password did not meet the policy." },

    // Password lifecycle
    { h: 44, t: "PASSWORD_CHANGE_SUCCESS", o: "SUCCESS", s: "INFO", e: "rosa.garcia@greenearth.ph", r: "ngo", ip: "112.200.55.2", m: "Password changed; all other sessions were signed out." },
    { h: 43, t: "PASSWORD_REUSE_REJECTED", o: "FAILURE", s: "INFO", e: "juan.santos@actionaid.ph", r: "ngo", ip: "112.200.7.90", m: "This password has been used recently. Please choose a different one." },
    { h: 41, t: "PASSWORD_MIN_AGE_REJECTED", o: "FAILURE", s: "INFO", e: "freshpw@bayanihub.local", r: "donor", ip: "112.200.8.4", m: "Your password was changed less than 24 hours ago and cannot be changed again yet." },
    { h: 18, t: "PASSWORD_RESET_REQUESTED", o: "SUCCESS", s: "INFO", e: "donor@bayanihub.local", r: "donor", ip: "112.200.9.31", m: "Password reset requested." },
    { h: 17, t: "SECURITY_ANSWER_FAILURE", o: "FAILURE", s: "WARN", e: "donor@bayanihub.local", r: "donor", ip: "198.51.100.77", m: "Incorrect security answers during password reset." },
    { h: 17, t: "SECURITY_ANSWER_SUCCESS", o: "SUCCESS", s: "INFO", e: "donor@bayanihub.local", r: "donor", ip: "112.200.9.31", m: "Security answers verified during password reset." },

    // Re-authentication
    { h: 12, t: "REAUTH_SUCCESS", o: "SUCCESS", s: "INFO", e: "admin@bayanihub.local", r: "admin", ip: "112.200.1.5", m: "Re-authenticated for a critical operation." },
    { h: 12, t: "REAUTH_FAILURE", o: "FAILURE", s: "WARN", e: "admin@bayanihub.local", r: "admin", ip: "112.200.1.5", m: "Re-authentication failed before a critical operation." },

    // Access control
    { h: 22, t: "ACCESS_DENIED_ROLE", o: "FAILURE", s: "WARN", e: "donor@bayanihub.local", r: "donor", ip: "112.200.9.31", meth: "GET", rt: "/security-logs", m: 'Role "donor" attempted GET /security-logs, which requires admin.' },
    { h: 21, t: "ACCESS_DENIED_OWNERSHIP", o: "FAILURE", s: "WARN", e: "juan.santos@actionaid.ph", r: "ngo", ip: "112.200.7.90", meth: "PUT", rt: "/posts/:postId", m: "ngo attempted to access a resource belonging to someone else: PUT /posts/…" },
    { h: 15, t: "ACCESS_DENIED_UNAUTHENTICATED", o: "FAILURE", s: "INFO", ip: "198.51.100.31", meth: "GET", rt: "/posts", m: "Unauthenticated request to a protected resource: GET /posts." },
    { h: 14, t: "ACCESS_DENIED_NO_POLICY", o: "FAILURE", s: "WARN", ip: "198.51.100.31", meth: "POST", rt: "/security-logs", m: "Denied by default: no access policy declared for POST /security-logs." },
    { h: 10, t: "AUTH_TOKEN_INVALID", o: "FAILURE", s: "WARN", ip: "198.51.100.62", meth: "GET", rt: "/admin/users", m: "Session token rejected (invalid) for GET /admin/users." },
    { h: 9, t: "ACCESS_GRANTED_SENSITIVE", o: "SUCCESS", s: "INFO", e: "admin@bayanihub.local", r: "admin", ip: "112.200.1.5", meth: "GET", rt: "/security-logs", m: "Authorized GET /security-logs." },

    // Validation
    { h: 33, t: "INPUT_VALIDATION_FAILURE", o: "FAILURE", s: "WARN", e: "mary.angela@redcross.ph", r: "ngo", ip: "112.200.14.7", meth: "POST", rt: "/posts", m: "Input rejected for POST /posts: body.supportTypes.monetary.targetAmount (custom)" },
    { h: 8, t: "INPUT_VALIDATION_FAILURE", o: "FAILURE", s: "WARN", e: "donor@bayanihub.local", r: "donor", ip: "112.200.9.31", meth: "POST", rt: "/payments/intent", m: "Input rejected for POST /payments/intent: body (unrecognized_keys)" },

    // Administration
    { h: 50, t: "ACCOUNT_APPROVED", o: "SUCCESS", s: "INFO", e: "admin@bayanihub.local", r: "admin", ip: "112.200.1.5", m: 'Organization "Green Earth Foundation" was approved.' },
    { h: 34, t: "ACCOUNT_REJECTED", o: "SUCCESS", s: "INFO", e: "admin@bayanihub.local", r: "admin", ip: "112.200.1.5", m: 'Organization "Unverified Outreach Group" was rejected.' },
    { h: 28, t: "POST_STATUS_CHANGED", o: "SUCCESS", s: "INFO", e: "admin@bayanihub.local", r: "admin", ip: "112.200.1.5", m: 'Project "Mangrove Reforestation Project" moved from Pending to Approved.' },
    { h: 4, t: "SECURITY_LOG_VIEWED", o: "SUCCESS", s: "INFO", e: "admin@bayanihub.local", r: "admin", ip: "112.200.1.5", m: "Security log viewed (128 matching entries)." },

    // Financial
    { h: 38, t: "PAYMENT_INTENT_CREATED", o: "SUCCESS", s: "INFO", e: "donor@bayanihub.local", r: "donor", ip: "112.200.9.31", m: "Payment intent created for ₱5150." },
    { h: 38, t: "PAYMENT_CONFIRMED", o: "SUCCESS", s: "INFO", e: "donor@bayanihub.local", r: "donor", ip: "112.200.9.31", m: "Payment of ₱5150 recorded." },
    { h: 11, t: "PAYMENT_CONFIRM_REJECTED", o: "FAILURE", s: "CRITICAL", e: "margaret.lim@corporate.com", r: "donor", ip: "198.51.100.88", m: "Attempt to confirm a payment intent that does not belong to the caller." },
    { h: 7, t: "REFUND_ISSUED", o: "SUCCESS", s: "CRITICAL", e: "mary.angela@redcross.ph", r: "ngo", ip: "112.200.14.7", m: "Refund of ₱2575 issued." },
    { h: 7, t: "REFUND_REJECTED", o: "FAILURE", s: "WARN", e: "juan.santos@actionaid.ph", r: "ngo", ip: "112.200.7.90", m: "Refund refused: That payment has already been refunded." },
    { h: 16, t: "CONTRIBUTION_CONFIRMED", o: "SUCCESS", s: "INFO", e: "mary.angela@redcross.ph", r: "ngo", ip: "112.200.14.7", m: "Contribution confirmed by the receiving organization." },
    { h: 16, t: "CONTRIBUTION_DECLINED", o: "SUCCESS", s: "INFO", e: "juan.santos@actionaid.ph", r: "ngo", ip: "112.200.7.90", m: "Contribution declined by the receiving organization." },

    // Errors
    { h: 3, t: "UNHANDLED_ERROR", o: "FAILURE", s: "CRITICAL", ip: "112.200.1.5", meth: "GET", rt: "/payments/:paymentId", m: "[7f3a1c2e-…] PrismaClientKnownRequestError: connection lost" },
  ];

  await prisma.securityLog.createMany({
    data: logEntries.map((entry) => ({
      createdAt: new Date(Date.now() - entry.h * 60 * 60 * 1000),
      eventType: entry.t,
      outcome: entry.o,
      severity: entry.s,
      actorEmail: entry.e ?? null,
      actorRole: entry.r ?? null,
      ipAddress: entry.ip ?? null,
      httpMethod: entry.meth ?? null,
      route: entry.rt ?? null,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/121.0",
      message: entry.m,
    })),
  });

  console.log(`  · created ${logEntries.length} security log entries`);

  /* ═════════════════════════════════════════════════════════════════════════
   * SUMMARY
   * ═══════════════════════════════════════════════════════════════════════ */

  console.log("\n  ┌────────────────────────────────────────────────────────────────────┐");
  console.log("  │  DEMO ACCOUNTS                                                     │");
  console.log("  └────────────────────────────────────────────────────────────────────┘");
  console.log("    1.1.1  Website Administrator   admin@bayanihub.local");
  console.log("    1.1.2  Product Manager (NGO)   mary.angela@redcross.ph");
  console.log("    1.1.3  Customer (Donor)        donor@bayanihub.local");
  console.log("");
  console.log("    Second administrator           second.admin@bayanihub.local");
  console.log("    Second NGO   [2.2.2 demo]      juan.santos@actionaid.ph");
  console.log("    Pending NGO  [2.1.4 demo]      pending.org@bayanihub.local");
  console.log("    Locked       [2.1.8 demo]      locked@bayanihub.local");
  console.log("    Fresh passwd [2.1.11 demo]     freshpw@bayanihub.local");

  if (generated.length > 0) {
    console.log("\n  ┌────────────────────────────────────────────────────────────────────┐");
    console.log("  │  GENERATED PASSWORDS — shown once, stored nowhere in readable form  │");
    console.log("  │  Set SEED_*_PASSWORD in .env to choose your own.                    │");
    console.log("  └────────────────────────────────────────────────────────────────────┘");
    for (const entry of generated) {
      console.log(`    ${entry.label.padEnd(38)} ${entry.password}`);
    }
  }

  console.log("\n    Security answers for every seeded account:");
  console.log('      "…street you lived on when you were ten"  →  Mapagmahal Street');
  console.log('      "…first live concert you attended"        →  Eraserheads at Cubao Expo');
  console.log("");
}

main()
  .catch((error) => {
    console.error("\n  Seed failed:", error.message, "\n");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
