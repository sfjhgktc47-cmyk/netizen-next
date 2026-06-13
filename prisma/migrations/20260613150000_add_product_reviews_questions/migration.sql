-- Extend existing review/question tables and add review votes.
-- ProductReview and ProductQuestion already exist (migration 20260605190000);
-- here we only add the columns and table the application code now requires.

ALTER TABLE "ProductReview" ADD COLUMN IF NOT EXISTS "images" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "ProductReview" ADD COLUMN IF NOT EXISTS "isVisible" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "ProductReview" ADD COLUMN IF NOT EXISTS "helpfulCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProductReview" ADD COLUMN IF NOT EXISTS "unhelpfulCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "ProductReview" ADD COLUMN IF NOT EXISTS "adminReply" TEXT NOT NULL DEFAULT '';

ALTER TABLE "ProductQuestion" ADD COLUMN IF NOT EXISTS "isVisible" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS "ProductReview_productId_isVisible_idx" ON "ProductReview"("productId", "isVisible");
CREATE INDEX IF NOT EXISTS "ProductQuestion_productId_isVisible_idx" ON "ProductQuestion"("productId", "isVisible");

CREATE TABLE IF NOT EXISTS "ProductReviewVote" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductReviewVote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProductReviewVote_reviewId_customerId_key" ON "ProductReviewVote"("reviewId", "customerId");
CREATE INDEX IF NOT EXISTS "ProductReviewVote_reviewId_idx" ON "ProductReviewVote"("reviewId");

ALTER TABLE "ProductReviewVote" ADD CONSTRAINT "ProductReviewVote_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "ProductReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductReviewVote" ADD CONSTRAINT "ProductReviewVote_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
