-- A 2026 legacy data migration created ASEAN demonstration profiles with
-- predictable, source-derived passwords. Those credentials predate the current
-- password policy and must never remain usable after the profiles are migrated
-- into UserAccount. The rows are synthetic fixtures; the current demo seed
-- replaces them with freshly generated credentials.
--
-- This forward-only migration also protects databases where the old migration
-- has already run. Revoking tokenVersion invalidates any outstanding session.
UPDATE "UserAccount"
SET
  "status" = 'Disabled'::"AccountState",
  "mustChangePassword" = TRUE,
  "tokenVersion" = "tokenVersion" + 1,
  "lockedUntil" = NULL,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE lower("email") IN (
  'brunei@gov.org.bn',
  'brunei.donor@gov.org.bn',
  'cambodia@gov.org.kh',
  'cambodia.donor@gov.org.kh',
  'indonesia@gov.org.id',
  'indonesia.donor@gov.org.id',
  'laos@gov.org.la',
  'laos.donor@gov.org.la',
  'malaysia@gov.org.my',
  'malaysia.donor@gov.org.my',
  'myanmar@gov.org.mm',
  'myanmar.donor@gov.org.mm',
  'philippines@gov.org.ph',
  'philippines.donor@gov.org.ph',
  'singapore@gov.org.sg',
  'singapore.donor@gov.org.sg',
  'thailand@gov.org.th',
  'thailand.donor@gov.org.th',
  'vietnam@gov.org.vn',
  'vietnam.donor@gov.org.vn'
);
