ALTER TABLE "Contribution"
ADD COLUMN "paymentIntentId" TEXT;

CREATE INDEX "Contribution_paymentIntentId_idx"
ON "Contribution"("paymentIntentId");
