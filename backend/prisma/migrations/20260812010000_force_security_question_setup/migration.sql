-- Existing accounts created before security questions were introduced, or
-- left with only a partial answer set, cannot complete the required two-factor
-- password-reset flow. Force those accounts
-- through the temporary-password setup boundary and revoke their live tokens.
--
-- The mustChangePassword predicate makes this safe to rerun: once a row has
-- been flagged, a second execution neither changes it nor bumps tokenVersion
-- again. Accounts already flagged are already constrained by the same runtime
-- boundary and therefore need no additional state change here.
UPDATE "UserAccount" AS account
SET
  "mustChangePassword" = TRUE,
  "tokenVersion" = account."tokenVersion" + 1,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE account."mustChangePassword" = FALSE
  AND (
    SELECT COUNT(*)
    FROM "SecurityAnswer" AS answer
    WHERE answer."accountId" = account."id"
  ) < 2;
