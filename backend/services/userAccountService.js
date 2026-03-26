import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

// How many times bcrypt re-hashes the password — 10 is the industry standard balance
// between security and performance. Higher = slower but more secure.
const SALT_ROUNDS = 10;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * sanitizeUser: Strips the password before sending user data to the frontend.
 * NEVER send a password (even hashed) in an API response :DDDDD
 */
const sanitizeUser = (user, role) => {
  const { password, ...rest } = user;
  return { ...rest, role };
};

/**
 * seedDefaultUsers: Creates default admin and donor accounts on server start.
 * Uses upsert so it's safe to call multiple times SOOOO IT won't create duplicates.
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
  country,    // for Donor registration
  affiliation, // for Donor registration
  bio,        // for Donor registration
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

  // ── Donor-specific validation ─────────────────────────────────────────────
  if (normalizedRole === "donor") {
    if (!affiliation?.trim()) {
      return { status: 400, body: { error: "Affiliation is required for donors." } };
    }
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
        country: country || "Philippines",  // default to Philippines if not provided
        affiliation: affiliation.trim(),    // required field
        bio: bio?.trim() || null,           // optional field
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
        country: country || "Philippines",  // default to Philippines if not provided
        bio: bio?.trim() || null,           // optional field
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

/**
 * sendPasswordResetEmail: Sends a password reset link via email.
 * Uses nodemailer with SMTP configuration from .env
 */
const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const resetLink = `${process.env.RESET_PASSWORD_URL}?token=${resetToken}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Bayanihub Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Password Reset Request</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. If you made this request, click the button below. This link expires in 24 hours.</p>
          <p style="margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p>Or copy this link: <a href="${resetLink}">${resetLink}</a></p>
          <p>If you didn't request a password reset, you can ignore this email. Your password won't be changed.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">Bayanihub Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};

/**
 * requestPasswordReset: Generates a reset token and sends password reset email.
 * Called when user clicks "Forgot Password" on login page.
 */
export const requestPasswordReset = async ({ email }) => {
  if (!email?.trim() || !EMAIL_REGEX.test(email.trim())) {
    return { status: 400, body: { error: "Valid email address is required." } };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check if email exists in any of the three user tables
  const donor = await prisma.donor.findUnique({ where: { email: normalizedEmail } });
  const org = await prisma.organization.findUnique({ where: { email: normalizedEmail } });
  const admin = await prisma.admin.findUnique({ where: { email: normalizedEmail } });

  if (!donor && !org && !admin) {
    // Don't reveal if email exists for security reasons
    return {
      status: 200,
      body: {
        message: "If an account exists with this email, you will receive a password reset link.",
      },
    };
  }

  // Generate secure random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token for storage (don't store plain tokens in DB)
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Store token in database with 24-hour expiration
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: {
      email: normalizedEmail,
      token: hashedToken,
      expiresAt,
    },
  });

  // Send email with reset token
  const emailSent = await sendPasswordResetEmail(normalizedEmail, resetToken);

  if (!emailSent) {
    // Delete the token if email fails to send
    await prisma.passwordResetToken.deleteMany({
      where: { token: hashedToken },
    });

    return {
      status: 500,
      body: { error: "Failed to send reset email. Please try again." },
    };
  }

  return {
    status: 200,
    body: {
      message: "If an account exists with this email, you will receive a password reset link.",
    },
  };
};

/**
 * verifyResetToken: Checks if a reset token is valid and not expired.
 * Returns the email associated with the token if valid.
 */
export const verifyResetToken = async (resetToken) => {
  if (!resetToken?.trim()) {
    return { status: 400, body: { error: "Reset token is required." } };
  }

  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash("sha256").update(resetToken.trim()).digest("hex");

  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
  });

  if (!tokenRecord) {
    return { status: 400, body: { error: "Invalid or expired reset token." } };
  }

  if (tokenRecord.isUsed) {
    return { status: 400, body: { error: "This reset token has already been used." } };
  }

  if (new Date() > tokenRecord.expiresAt) {
    return { status: 400, body: { error: "Reset token has expired. Please request a new one." } };
  }

  return {
    status: 200,
    body: { email: tokenRecord.email },
  };
};

/**
 * resetPassword: Updates password for a user using a valid reset token.
 * Marks the token as used after successful reset.
 */
export const resetPassword = async ({ resetToken, newPassword }) => {
  if (!resetToken?.trim()) {
    return { status: 400, body: { error: "Reset token is required." } };
  }

  if (!newPassword || newPassword.length < 6) {
    return { status: 400, body: { error: "Password must be at least 6 characters." } };
  }

  // Hash the token to compare with stored hash
  const hashedToken = crypto.createHash("sha256").update(resetToken.trim()).digest("hex");

  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
  });

  if (!tokenRecord) {
    return { status: 400, body: { error: "Invalid or expired reset token." } };
  }

  if (tokenRecord.isUsed) {
    return { status: 400, body: { error: "This reset token has already been used." } };
  }

  if (new Date() > tokenRecord.expiresAt) {
    return { status: 400, body: { error: "Reset token has expired. Please request a new one." } };
  }

  const userEmail = tokenRecord.email;
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

  // Update password in all three user tables (whichever has the email)
  await Promise.all([
    prisma.donor.updateMany({
      where: { email: userEmail },
      data: { password: hashedPassword },
    }),
    prisma.organization.updateMany({
      where: { email: userEmail },
      data: { password: hashedPassword },
    }),
    prisma.admin.updateMany({
      where: { email: userEmail },
      data: { password: hashedPassword },
    }),
  ]);

  // Mark the token as used
  await prisma.passwordResetToken.update({
    where: { token: hashedToken },
    data: { isUsed: true },
  });

  return {
    status: 200,
    body: {
      message: "Password reset successful. You can now login with your new password.",
    },
  };
};