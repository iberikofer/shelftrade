-- AddUniqueConstraint: enforce one exchange request per (fromUser, toBook) pair
-- First deduplicate any existing rows, keeping the most recent one per pair
DELETE FROM "exchange_requests" a
USING "exchange_requests" b
WHERE a."createdAt" < b."createdAt"
  AND a."fromUserId" = b."fromUserId"
  AND a."toBookId" = b."toBookId";

ALTER TABLE "exchange_requests" ADD CONSTRAINT "exchange_requests_fromUserId_toBookId_key" UNIQUE ("fromUserId", "toBookId");
