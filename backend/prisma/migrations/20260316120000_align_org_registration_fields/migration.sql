ALTER TABLE "Organization"
ADD COLUMN "firstName" TEXT,
ADD COLUMN "surname" TEXT,
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending';

UPDATE "Organization"
SET
  "firstName" = COALESCE(NULLIF(split_part("representativePerson", ' ', 1), ''), 'Unknown'),
  "surname" = COALESCE(NULLIF(regexp_replace("representativePerson", '^\S+\s*', ''), ''), 'Unknown')
WHERE "firstName" IS NULL OR "surname" IS NULL;

ALTER TABLE "Organization"
ALTER COLUMN "firstName" SET NOT NULL,
ALTER COLUMN "surname" SET NOT NULL,
ALTER COLUMN "orgName" DROP DEFAULT,
ALTER COLUMN "email" DROP DEFAULT,
DROP COLUMN "representativePerson";
