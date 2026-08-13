CREATE TABLE "DonorBookmark" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonorBookmark_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DonorBookmark_accountId_projectId_key"
ON "DonorBookmark"("accountId", "projectId");

CREATE INDEX "DonorBookmark_accountId_updatedAt_idx"
ON "DonorBookmark"("accountId", "updatedAt");

ALTER TABLE "DonorBookmark"
ADD CONSTRAINT "DonorBookmark_accountId_fkey"
FOREIGN KEY ("accountId") REFERENCES "UserAccount"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "DonorBookmark"
ADD CONSTRAINT "DonorBookmark_projectId_fkey"
FOREIGN KEY ("projectId") REFERENCES "Post"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
