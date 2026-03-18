import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";

// How many times bcrypt re-hashes the password — 10 is the industry standard balance
// between security and performance. Higher = slower but more secure.
const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * sanitizeUser: Strips the password before sending user data to the frontend.
 * NEVER send a password (even hashed) in an API response.
 */
const sanitizeUser = (user, role) => {
  const { password, ...rest } = user;
  return { ...rest, role };
};

/**
 * seedDefaultUsers: Creates default admin and donor accounts on server start.
 * Uses upsert so it's safe to call multiple times — won't create duplicates.
 *
 * Why bcrypt instead of the old sha256?
 * SHA256 is a fast hashing algorithm — fast is bad for passwords because
 * attackers can try billions of combinations per second.
 * bcrypt is intentionally slow and adds a random salt, making brute force
 * attacks much harder.
 */
export const seedDefaultUsers = async () => {
  // Seed default admin
  const adminExists = await prisma.admin.findUnique({
    where: { email: "admin@bayanihub.local" },
  });

  if (!adminExists) {
    await prisma.admin.create({
      data: {
        firstName: "System",
        lastName: "Admin",
        email: "admin@bayanihub.local",
        password: await bcrypt.hash("admin123", SALT_ROUNDS),
      },
    });
    console.log("Default admin seeded: admin@bayanihub.local / admin123");
  }

  // Seed default donor
  const donorExists = await prisma.donor.findUnique({
    where: { email: "donor@bayanihub.local" },
  });

  if (!donorExists) {
    await prisma.donor.create({
      data: {
        firstName: "Demo",
        lastName: "Donor",
        email: "donor@bayanihub.local",
        password: await bcrypt.hash("donor123", SALT_ROUNDS),
        isVerified: true,
        status: "Approved",
      },
    });
    console.log("Default donor seeded: donor@bayanihub.local / donor123");
  }
};

/**
 * registerUser: Handles registration for both Donor and NGO roles.
 *
 * Why separate models instead of one UserAccount table?
 * Donor and Organization have different fields and different approval flows.
 * Keeping them separate means cleaner queries and no nullable columns
 * that only apply to one type.
 */
export const registerUser = async ({
  firstName,
  surname,   // frontend sends surname, we map to lastName for Donor
  email,
  password,
  role,
  orgName,
}) => {
  // ── Validation ──────────────────────────────────────────────────────────────
  if (!firstName?.trim() || !surname?.trim()) {
    return { status: 400, body: { error: "First name and surname are required." } };
  }

  if (!email?.trim() || !EMAIL_REGEX.test(email.trim())) {
    return { status: 400, body: { error: "Valid email address is required." } };
  }

  if (!password || password.length < 6) {
    return { status: 400, body: { error: "Password must be at least 6 characters." } };
  }

  const normalizedRole = (role || "donor").toLowerCase();
  if (!["donor", "ngo"].includes(normalizedRole)) {
    return { status: 400, body: { error: "Invalid role." } };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // ── Check for duplicate email across both tables ─────────────────────────
  // We check both Donor and Organization since email must be unique platform-wide
  const existingDonor = await prisma.donor.findUnique({ where: { email: normalizedEmail } });
  const existingOrg = await prisma.organization.findUnique({ where: { email: normalizedEmail } });

  if (existingDonor || existingOrg) {
    return { status: 409, body: { error: "Email already registered." } };
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  // ── Create the appropriate model based on role ───────────────────────────
  if (normalizedRole === "donor") {
    const donor = await prisma.donor.create({
      data: {
        firstName: firstName.trim(),
        lastName: surname.trim(),  // frontend uses surname, Donor model uses lastName
        email: normalizedEmail,
        password: hashedPassword,
        isVerified: true,           // donors are auto-verified
        status: "Approved",         // donors don't need admin approval
      },
    });

    return {
      status: 201,
      body: {
        message: "Registration successful.",
        user: sanitizeUser(donor, "donor"),
      },
    };
  }

  if (normalizedRole === "ngo") {
    const org = await prisma.organization.create({
      data: {
        orgName: orgName?.trim() || `${firstName.trim()} ${surname.trim()}`,
        firstName: firstName.trim(),
        surname: surname.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        isVerified: false,          // NGOs must be approved by admin first
        status: "Pending",
      },
    });

    return {
      status: 201,
      body: {
        message: "Registration submitted. Account is pending admin approval.",
        user: sanitizeUser(org, "ngo"),
      },
    };
  }
};

/**
 * loginUser: Checks credentials across Admin, Donor, and Organization tables.
 *
 * Why check three tables?
 * We have no single User table — each role has its own model.
 * We check in order: Admin → Donor → Organization.
 * If the role param is provided, we only check the matching table.
 */
export const loginUser = async ({ email, password, role }) => {
  if (!email?.trim() || !password) {
    return { status: 400, body: { error: "Email and password are required." } };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRole = (role || "").toLowerCase();

  let user = null;
  let userRole = null;

  // ── Look up user in the correct table based on role ──────────────────────
  if (normalizedRole === "admin") {
    user = await prisma.admin.findUnique({ where: { email: normalizedEmail } });
    userRole = "admin";
  } else if (normalizedRole === "donor") {
    user = await prisma.donor.findUnique({ where: { email: normalizedEmail } });
    userRole = "donor";
  } else if (normalizedRole === "ngo") {
    user = await prisma.organization.findUnique({ where: { email: normalizedEmail } });
    userRole = "ngo";
  } else {
    // No role provided — check all three tables in order
    user = await prisma.admin.findUnique({ where: { email: normalizedEmail } });
    if (user) { userRole = "admin"; }

    if (!user) {
      user = await prisma.donor.findUnique({ where: { email: normalizedEmail } });
      if (user) { userRole = "donor"; }
    }

    if (!user) {
      user = await prisma.organization.findUnique({ where: { email: normalizedEmail } });
      if (user) { userRole = "ngo"; }
    }
  }

  if (!user) {
    return { status: 401, body: { error: "Invalid credentials." } };
  }

  // ── Verify password using bcrypt.compare ─────────────────────────────────
  // bcrypt.compare handles the salt automatically — you never need to salt manually
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return { status: 401, body: { error: "Invalid credentials." } };
  }

  // ── NGO-specific check: must be approved before logging in ───────────────
  if (userRole === "ngo" && user.status !== "Approved") {
    return {
      status: 403,
      body: { error: "NGO account is still pending admin approval." },
    };
  }

  // ── Generate JWT token ───────────────────────────────────────────────────
  const token = jwt.sign(
    { id: user.id, role: userRole },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    status: 200,
    body: {
      message: "Login successful.",
      user: sanitizeUser(user, userRole),
      token,
    },
  };
};

/**
 * getPendingNgoUsers: Returns all organizations with Pending status.
 * Used by the admin panel to review and approve/reject NGO registrations.
 */
export const getPendingNgoUsers = async () => {
  const orgs = await prisma.organization.findMany({
    where: { status: "Pending" },
    orderBy: { createdAt: "desc" },
  });

  // Remove passwords before returning
  return orgs.map((org) => {
    const { password, ...rest } = org;
    return rest;
  });
};

/**
 * updateNgoApproval: Approves or rejects an NGO account.
 * Called by the admin when reviewing pending accounts.
 */
export const updateNgoApproval = async (id, action) => {
  const isApprove = action === "approve";

  const updated = await prisma.organization.update({
    where: { id },
    data: {
      status: isApprove ? "Approved" : "Rejected",
      isVerified: isApprove,
    },
  });

  const { password, ...rest } = updated;
  return rest;
};