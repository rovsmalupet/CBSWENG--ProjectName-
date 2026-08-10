-- ═══════════════════════════════════════════════════════════════════════════
-- CSSECDV security controls
--
-- Introduces UserAccount as the single home for authentication, plus the
-- supporting tables for password history, security questions, and the security
-- log. Backfills every existing Admin / Donor / Organization row, then drops
-- the three duplicated `password` columns.
--
-- The backfill runs INSIDE this migration rather than in a separate script so
-- the whole thing is one transaction: either every account is migrated with its
-- password intact, or nothing changes. A half-migrated auth table is the one
-- outcome we cannot tolerate.
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- STEP 0. Refuse to run if an email exists in more than one profile table.
--
-- UserAccount.email is UNIQUE. Merging two rows that share an email would
-- silently give one person's password to another person's profile, so we fail
-- loudly and let a human decide instead. [2.1.2 — fail securely]
-- ───────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
    duplicate_emails TEXT;
BEGIN
    SELECT string_agg(email, ', ')
      INTO duplicate_emails
      FROM (
        SELECT lower(email) AS email
          FROM (
            SELECT email FROM "Admin"
            UNION ALL SELECT email FROM "Donor"
            UNION ALL SELECT email FROM "Organization"
          ) AS all_emails
         GROUP BY lower(email)
        HAVING count(*) > 1
      ) AS dupes;

    IF duplicate_emails IS NOT NULL THEN
        RAISE EXCEPTION
          'Migration aborted: these emails exist in more than one user table and must be resolved by hand first: %',
          duplicate_emails;
    END IF;
END $$;

-- ───────────────────────────────────────────────────────────────────────────
-- STEP 1. Enums
-- ───────────────────────────────────────────────────────────────────────────
CREATE TYPE "UserRole" AS ENUM ('admin', 'ngo', 'donor');
CREATE TYPE "AccountState" AS ENUM ('Active', 'Pending', 'Disabled', 'Rejected');
CREATE TYPE "LogOutcome" AS ENUM ('SUCCESS', 'FAILURE');
CREATE TYPE "LogSeverity" AS ENUM ('INFO', 'WARN', 'CRITICAL');

-- ───────────────────────────────────────────────────────────────────────────
-- STEP 2. Authentication tables
-- ───────────────────────────────────────────────────────────────────────────
CREATE TABLE "UserAccount" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "AccountState" NOT NULL DEFAULT 'Active',

    -- lockout [2.1.8]
    "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),

    -- password lifecycle [2.1.11]
    "passwordChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,

    -- last-use reporting [2.1.12]
    "lastLoginAt" TIMESTAMP(3),
    "lastLoginIp" TEXT,
    "lastFailedLoginAt" TIMESTAMP(3),
    "lastFailedLoginIp" TEXT,
    "failedAttemptsSinceLogin" INTEGER NOT NULL DEFAULT 0,

    -- session revocation
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- No DEFAULT: Prisma's @updatedAt is client-managed. The backfill below sets
    -- it explicitly. Adding a default here would register as schema drift.
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserAccount_email_key" ON "UserAccount"("email");
CREATE INDEX "UserAccount_role_status_idx" ON "UserAccount"("role", "status");

CREATE TABLE "PasswordHistory" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PasswordHistory_accountId_createdAt_idx" ON "PasswordHistory"("accountId", "createdAt");

CREATE TABLE "SecurityAnswer" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "answerHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityAnswer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SecurityAnswer_accountId_questionKey_key" ON "SecurityAnswer"("accountId", "questionKey");

CREATE TABLE "SecurityLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventType" TEXT NOT NULL,
    "outcome" "LogOutcome" NOT NULL,
    "severity" "LogSeverity" NOT NULL DEFAULT 'INFO',
    "actorAccountId" TEXT,
    "actorEmail" TEXT,
    "actorRole" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "httpMethod" TEXT,
    "route" TEXT,
    "targetType" TEXT,
    "targetId" TEXT,
    "message" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "SecurityLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SecurityLog_createdAt_idx" ON "SecurityLog"("createdAt");
CREATE INDEX "SecurityLog_eventType_outcome_idx" ON "SecurityLog"("eventType", "outcome");
CREATE INDEX "SecurityLog_actorAccountId_idx" ON "SecurityLog"("actorAccountId");
CREATE INDEX "SecurityLog_ipAddress_idx" ON "SecurityLog"("ipAddress");
CREATE INDEX "SecurityLog_severity_idx" ON "SecurityLog"("severity");

-- ───────────────────────────────────────────────────────────────────────────
-- STEP 3. Add the (initially nullable) link column to each profile table
-- ───────────────────────────────────────────────────────────────────────────
ALTER TABLE "Admin"        ADD COLUMN "accountId" TEXT;
ALTER TABLE "Donor"        ADD COLUMN "accountId" TEXT;
ALTER TABLE "Organization" ADD COLUMN "accountId" TEXT;

-- ───────────────────────────────────────────────────────────────────────────
-- STEP 4. Backfill UserAccount from the three profile tables
--
-- Existing bcrypt hashes are carried across verbatim: nobody's password breaks,
-- and no plaintext is ever needed. Hashes created at the old cost factor stay
-- valid because bcrypt encodes its cost in the hash string; they are transparently
-- upgraded to the current cost the next time each user logs in
-- (see rehashIfNeeded in security/passwordPolicy.js).
--
-- passwordChangedAt is seeded from createdAt so the minimum-age rule [2.1.11]
-- has a sane baseline instead of treating every legacy account as "just changed".
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO "UserAccount" (
    "id", "email", "passwordHash", "role", "status",
    "passwordChangedAt", "createdAt", "updatedAt"
)
SELECT
    gen_random_uuid()::text,
    lower(a."email"),
    a."password",
    'admin'::"UserRole",
    'Active'::"AccountState",
    a."createdAt",
    a."createdAt",
    CURRENT_TIMESTAMP
FROM "Admin" a;

INSERT INTO "UserAccount" (
    "id", "email", "passwordHash", "role", "status",
    "passwordChangedAt", "createdAt", "updatedAt"
)
SELECT
    gen_random_uuid()::text,
    lower(d."email"),
    d."password",
    'donor'::"UserRole",
    CASE d."status"
        WHEN 'Approved' THEN 'Active'::"AccountState"
        WHEN 'Active'   THEN 'Active'::"AccountState"
        WHEN 'Rejected' THEN 'Rejected'::"AccountState"
        ELSE 'Pending'::"AccountState"
    END,
    d."createdAt",
    d."createdAt",
    CURRENT_TIMESTAMP
FROM "Donor" d;

INSERT INTO "UserAccount" (
    "id", "email", "passwordHash", "role", "status",
    "passwordChangedAt", "createdAt", "updatedAt"
)
SELECT
    gen_random_uuid()::text,
    lower(o."email"),
    o."password",
    'ngo'::"UserRole",
    CASE o."status"
        WHEN 'Approved' THEN 'Active'::"AccountState"
        WHEN 'Active'   THEN 'Active'::"AccountState"
        WHEN 'Rejected' THEN 'Rejected'::"AccountState"
        ELSE 'Pending'::"AccountState"
    END,
    o."createdAt",
    o."createdAt",
    CURRENT_TIMESTAMP
FROM "Organization" o;

-- ───────────────────────────────────────────────────────────────────────────
-- STEP 5. Link each profile row to its new account
-- ───────────────────────────────────────────────────────────────────────────
UPDATE "Admin" a
   SET "accountId" = u."id"
  FROM "UserAccount" u
 WHERE u."email" = lower(a."email") AND u."role" = 'admin';

UPDATE "Donor" d
   SET "accountId" = u."id"
  FROM "UserAccount" u
 WHERE u."email" = lower(d."email") AND u."role" = 'donor';

UPDATE "Organization" o
   SET "accountId" = u."id"
  FROM "UserAccount" u
 WHERE u."email" = lower(o."email") AND u."role" = 'ngo';

-- Verify every profile row found an account before we enforce NOT NULL.
DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    SELECT (SELECT count(*) FROM "Admin"        WHERE "accountId" IS NULL)
         + (SELECT count(*) FROM "Donor"        WHERE "accountId" IS NULL)
         + (SELECT count(*) FROM "Organization" WHERE "accountId" IS NULL)
      INTO orphan_count;

    IF orphan_count > 0 THEN
        RAISE EXCEPTION
          'Migration aborted: % profile row(s) could not be linked to a UserAccount.',
          orphan_count;
    END IF;
END $$;

-- ───────────────────────────────────────────────────────────────────────────
-- STEP 6. Seed password history so re-use prevention [2.1.10] is armed from
--         day one — a user cannot "change" to the password they already have.
-- ───────────────────────────────────────────────────────────────────────────
INSERT INTO "PasswordHistory" ("id", "accountId", "passwordHash", "createdAt")
SELECT gen_random_uuid()::text, u."id", u."passwordHash", u."passwordChangedAt"
FROM "UserAccount" u;

-- ───────────────────────────────────────────────────────────────────────────
-- STEP 7. Enforce the link, then drop the duplicated password columns
-- ───────────────────────────────────────────────────────────────────────────
ALTER TABLE "Admin"        ALTER COLUMN "accountId" SET NOT NULL;
ALTER TABLE "Donor"        ALTER COLUMN "accountId" SET NOT NULL;
ALTER TABLE "Organization" ALTER COLUMN "accountId" SET NOT NULL;

CREATE UNIQUE INDEX "Admin_accountId_key"        ON "Admin"("accountId");
CREATE UNIQUE INDEX "Donor_accountId_key"        ON "Donor"("accountId");
CREATE UNIQUE INDEX "Organization_accountId_key" ON "Organization"("accountId");

ALTER TABLE "Admin"        DROP COLUMN "password";
ALTER TABLE "Donor"        DROP COLUMN "password";
ALTER TABLE "Organization" DROP COLUMN "password";

-- ───────────────────────────────────────────────────────────────────────────
-- STEP 8. Password reset tokens gain the security-question gate [2.1.9]
-- ───────────────────────────────────────────────────────────────────────────
ALTER TABLE "PasswordResetToken"
    ADD COLUMN "accountId" TEXT,
    ADD COLUMN "answersVerifiedAt" TIMESTAMP(3),
    ADD COLUMN "answerAttempts" INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN "lockedAt" TIMESTAMP(3);

UPDATE "PasswordResetToken" t
   SET "accountId" = u."id"
  FROM "UserAccount" u
 WHERE u."email" = lower(t."email");

CREATE INDEX "PasswordResetToken_email_idx"     ON "PasswordResetToken"("email");
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- ───────────────────────────────────────────────────────────────────────────
-- STEP 9. Contribution confirmation tracking [2.2.3]
-- ───────────────────────────────────────────────────────────────────────────
ALTER TABLE "Contribution"
    ADD COLUMN "statusChangedAt" TIMESTAMP(3),
    ADD COLUMN "statusChangedBy" TEXT;

CREATE INDEX "Contribution_postId_status_idx"  ON "Contribution"("postId", "status");
CREATE INDEX "Contribution_partnershipId_idx"  ON "Contribution"("partnershipId");

-- ───────────────────────────────────────────────────────────────────────────
-- STEP 10. Foreign keys
-- ───────────────────────────────────────────────────────────────────────────
ALTER TABLE "Admin"        ADD CONSTRAINT "Admin_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Donor"        ADD CONSTRAINT "Donor_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PasswordHistory" ADD CONSTRAINT "PasswordHistory_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SecurityAnswer"  ADD CONSTRAINT "SecurityAnswer_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_accountId_fkey"
    FOREIGN KEY ("accountId") REFERENCES "UserAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SetNull, not Cascade: a deleted account must not erase the audit trail of
-- what it did. [2.4.3]
ALTER TABLE "SecurityLog" ADD CONSTRAINT "SecurityLog_actorAccountId_fkey"
    FOREIGN KEY ("actorAccountId") REFERENCES "UserAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
