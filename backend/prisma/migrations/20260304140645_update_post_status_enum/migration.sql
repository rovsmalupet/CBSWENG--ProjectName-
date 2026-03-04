/*
  Warnings:

  - The values [Draft,Published] on the enum `PostStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PostStatus_new" AS ENUM ('Pending', 'Approved', 'Unapproved', 'Edited', 'Deleted');
ALTER TABLE "Post" ALTER COLUMN "overallStatus" DROP DEFAULT;
ALTER TABLE "Post" ALTER COLUMN "overallStatus" TYPE "PostStatus_new" USING (
  CASE 
    WHEN "overallStatus"::text = 'Draft' THEN 'Unapproved'::"PostStatus_new"
    WHEN "overallStatus"::text = 'Published' THEN 'Approved'::"PostStatus_new"
    ELSE "overallStatus"::text::"PostStatus_new"
  END
);
ALTER TYPE "PostStatus" RENAME TO "PostStatus_old";
ALTER TYPE "PostStatus_new" RENAME TO "PostStatus";
DROP TYPE "PostStatus_old";
ALTER TABLE "Post" ALTER COLUMN "overallStatus" SET DEFAULT 'Unapproved';
COMMIT;
