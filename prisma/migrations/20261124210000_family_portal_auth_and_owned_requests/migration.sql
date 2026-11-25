ALTER TABLE "families"
  ADD COLUMN "public_id" VARCHAR(20),
  ADD COLUMN "refresh_token" TEXT,
  ADD COLUMN "must_change_password" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "deleted_at" TIMESTAMP(3);

UPDATE "families"
SET "public_id" = 'FAM-' || CASE
  WHEN length("id"::text) < 6 THEN lpad("id"::text, 6, '0')
  ELSE "id"::text
END;

ALTER TABLE "families" ALTER COLUMN "public_id" SET NOT NULL;

CREATE UNIQUE INDEX "families_public_id_key" ON "families"("public_id");
CREATE UNIQUE INDEX "families_refresh_token_key" ON "families"("refresh_token");

CREATE TABLE "legacy_family_requests" AS
SELECT
  "id",
  "family_id",
  "requested_by",
  "title",
  "before_data",
  "after_data",
  "justification",
  "status"::text AS "status",
  "approved_by",
  "approved_at",
  "reviewed_by",
  "reviewed_at",
  "rejection_reason",
  "cancellation_reason",
  "type"::text AS "type"
FROM "family_requests";

DELETE FROM "family_requests";

DROP INDEX IF EXISTS "family_requests_pending_update_family_key";
DROP INDEX IF EXISTS "family_requests_requested_by_idx";

ALTER TABLE "family_requests"
  DROP CONSTRAINT IF EXISTS "family_requests_type_family_check",
  DROP CONSTRAINT IF EXISTS "family_requests_family_id_fkey",
  DROP CONSTRAINT IF EXISTS "family_requests_requested_by_fkey",
  DROP CONSTRAINT IF EXISTS "family_requests_approved_by_fkey";

ALTER TABLE "family_requests"
  DROP COLUMN "type",
  DROP COLUMN "requested_by",
  DROP COLUMN "approved_by",
  DROP COLUMN "approved_at",
  ALTER COLUMN "family_id" SET NOT NULL;

ALTER TABLE "family_requests"
  ADD CONSTRAINT "family_requests_family_id_fkey"
  FOREIGN KEY ("family_id") REFERENCES "families"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "family_requests_one_pending_per_family_key"
ON "family_requests" ("family_id")
WHERE "status" = 'PENDING';

ALTER TABLE "family_requests"
  ADD CONSTRAINT "family_requests_review_audit_check"
  CHECK (
    "status" NOT IN ('APPROVED', 'REJECTED')
    OR ("reviewed_by" IS NOT NULL AND "reviewed_at" IS NOT NULL)
  ),
  ADD CONSTRAINT "family_requests_rejection_reason_check"
  CHECK ("status" <> 'REJECTED' OR "rejection_reason" IS NOT NULL);

DROP TYPE "FamilyRequestType";
