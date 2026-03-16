import { randomUUID, createHash } from "crypto";
import prisma from "../prisma/client.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const hashPassword = (password) => createHash("sha256").update(password).digest("hex");

export const ensureUserAccountTable = async () => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "UserAccount" (
      "id" TEXT PRIMARY KEY,
      "firstName" TEXT NOT NULL,
      "surname" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "role" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'active',
      "affiliation" TEXT,
      "representativePerson" TEXT,
      "isVerified" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

const sanitizeUser = (row) => ({
  id: row.id,
  firstName: row.firstName,
  surname: row.surname,
  email: row.email,
  role: row.role,
  status: row.status,
  affiliation: row.affiliation,
  representativePerson: row.representativePerson,
  isVerified: row.isVerified,
  createdAt: row.createdAt,
});

export const seedDefaultUsers = async () => {
  await ensureUserAccountTable();

  const adminEmail = "admin@bayanihub.local";
  const donorEmail = "donor@bayanihub.local";

  const existingAdmin = await prisma.$queryRaw`
    SELECT "id" FROM "UserAccount" WHERE "email" = ${adminEmail} LIMIT 1
  `;

  if (existingAdmin.length === 0) {
    await prisma.$executeRaw`
      INSERT INTO "UserAccount"
      ("id", "firstName", "surname", "email", "password", "role", "status", "isVerified")
      VALUES
      (${randomUUID()}, ${"System"}, ${"Admin"}, ${adminEmail}, ${hashPassword("admin123")}, ${"admin"}, ${"active"}, ${true})
    `;
  }

  const existingDonor = await prisma.$queryRaw`
    SELECT "id" FROM "UserAccount" WHERE "email" = ${donorEmail} LIMIT 1
  `;

  if (existingDonor.length === 0) {
    await prisma.$executeRaw`
      INSERT INTO "UserAccount"
      ("id", "firstName", "surname", "email", "password", "role", "status", "isVerified")
      VALUES
      (${randomUUID()}, ${"Demo"}, ${"Donor"}, ${donorEmail}, ${hashPassword("donor123")}, ${"donor"}, ${"active"}, ${true})
    `;
  }
};

export const registerUser = async ({
  firstName,
  surname,
  email,
  password,
  role,
  affiliation,
  representativePerson,
}) => {
  await ensureUserAccountTable();

  if (!firstName?.trim() || !surname?.trim()) {
    return { status: 400, body: { error: "First Name and Surname are required." } };
  }

  if (!email?.trim() || !EMAIL_REGEX.test(email.trim())) {
    return { status: 400, body: { error: "Valid Email Address is required." } };
  }

  if (!password || password.length < 6) {
    return { status: 400, body: { error: "Password must be at least 6 characters." } };
  }

  const normalizedRole = (role || "ngo").toLowerCase();
  if (!["donor", "ngo", "admin"].includes(normalizedRole)) {
    return { status: 400, body: { error: "Invalid role." } };
  }

  if (normalizedRole === "ngo" && (!affiliation?.trim() || !representativePerson?.trim())) {
    return {
      status: 400,
      body: { error: "Affiliation and Representative Person are required for NGO." },
    };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.$queryRaw`
    SELECT "id" FROM "UserAccount" WHERE "email" = ${normalizedEmail} LIMIT 1
  `;

  if (existing.length > 0) {
    return { status: 409, body: { error: "Email already registered." } };
  }

  const status = normalizedRole === "ngo" ? "pending" : "active";
  const isVerified = normalizedRole !== "ngo";

  const id = randomUUID();

  await prisma.$executeRaw`
    INSERT INTO "UserAccount"
    ("id", "firstName", "surname", "email", "password", "role", "status", "affiliation", "representativePerson", "isVerified")
    VALUES
    (
      ${id},
      ${firstName.trim()},
      ${surname.trim()},
      ${normalizedEmail},
      ${hashPassword(password)},
      ${normalizedRole},
      ${status},
      ${affiliation?.trim() || null},
      ${representativePerson?.trim() || null},
      ${isVerified}
    )
  `;

  const created = await prisma.$queryRaw`
    SELECT * FROM "UserAccount" WHERE "id" = ${id} LIMIT 1
  `;

  return {
    status: 201,
    body: {
      message:
        normalizedRole === "ngo"
          ? "Registration submitted. Account is pending admin approval."
          : "Registration successful.",
      user: sanitizeUser(created[0]),
    },
  };
};

export const loginUser = async ({ email, password, role }) => {
  await ensureUserAccountTable();

  const normalizedEmail = (email || "").trim().toLowerCase();
  if (!normalizedEmail || !password) {
    return { status: 400, body: { error: "Email and Password are required." } };
  }

  const rows = await prisma.$queryRaw`
    SELECT * FROM "UserAccount" WHERE "email" = ${normalizedEmail} LIMIT 1
  `;

  if (rows.length === 0) {
    return { status: 401, body: { error: "Invalid credentials." } };
  }

  const user = rows[0];
  const roleMatch = !role || user.role === role;
  if (!roleMatch) {
    return { status: 403, body: { error: "Role mismatch for this account." } };
  }

  if (user.password !== hashPassword(password)) {
    return { status: 401, body: { error: "Invalid credentials." } };
  }

  if (user.role === "ngo" && user.status !== "approved") {
    return { status: 403, body: { error: "NGO account is still pending approval." } };
  }

  return {
    status: 200,
    body: {
      message: "Login successful.",
      user: sanitizeUser(user),
    },
  };
};

export const getPendingNgoUsers = async () => {
  await ensureUserAccountTable();
  const rows = await prisma.$queryRaw`
    SELECT *
    FROM "UserAccount"
    WHERE "role" = ${"ngo"} AND "status" = ${"pending"}
    ORDER BY "createdAt" DESC
  `;
  return rows.map(sanitizeUser);
};

export const updateNgoApproval = async (id, action) => {
  await ensureUserAccountTable();

  const isApprove = action === "approve";
  const nextStatus = isApprove ? "approved" : "rejected";
  const nextVerified = isApprove;

  await prisma.$executeRaw`
    UPDATE "UserAccount"
    SET "status" = ${nextStatus}, "isVerified" = ${nextVerified}
    WHERE "id" = ${id} AND "role" = ${"ngo"}
  `;

  const rows = await prisma.$queryRaw`
    SELECT * FROM "UserAccount" WHERE "id" = ${id} LIMIT 1
  `;

  if (rows.length === 0) {
    return null;
  }

  return sanitizeUser(rows[0]);
};
