-- Add optional JSON budget breakdown for campaign fund allocation display
ALTER TABLE "Post"
ADD COLUMN "budgetBreakdown" JSONB;
