-- AlterTable Payment (add refund tracking fields)
ALTER TABLE "Payment" ADD COLUMN "refundIntentId" TEXT,
ADD COLUMN "refundedAt" TIMESTAMP(3),
ADD COLUMN "refundStatus" TEXT,
ADD COLUMN "refundAmount" DOUBLE PRECISION,
ADD COLUMN "refundReason" TEXT;

-- CreateTable Refund
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "refundIntentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "contributionId" TEXT,
    "processedBy" TEXT,
    "processedByRole" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Refund_paymentId_key" ON "Refund"("paymentId");
CREATE UNIQUE INDEX "Refund_refundIntentId_key" ON "Refund"("refundIntentId");

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
