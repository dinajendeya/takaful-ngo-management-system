CREATE TYPE "FamilyRequestType" AS ENUM ('REGISTRATION', 'UPDATE');
CREATE TYPE "FamilyRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

ALTER TABLE "family_requests"
  ADD COLUMN "type" "FamilyRequestType" NOT NULL DEFAULT 'UPDATE',
  ADD COLUMN "approved_by" BIGINT,
  ADD COLUMN "approved_at" TIMESTAMP(3);
ALTER TABLE "family_requests" ALTER COLUMN "type" DROP DEFAULT;

ALTER TABLE "family_requests" ALTER COLUMN "family_id" DROP NOT NULL;

UPDATE "family_requests" AS r
SET "requested_by" = fm."created_by"
FROM "family_members" AS fm
WHERE r."requested_by" = fm."id";

ALTER TABLE "family_requests"
  DROP CONSTRAINT "family_requests_family_id_fkey",
  DROP CONSTRAINT "family_requests_requested_by_fkey";

ALTER TABLE "family_requests"
  ADD CONSTRAINT "family_requests_family_id_fkey"
  FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "family_requests_requested_by_fkey"
  FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "family_requests_approved_by_fkey"
  FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "family_requests"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "FamilyRequestStatus"
  USING ("status"::text::"FamilyRequestStatus"),
  ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "family_requests"
  ADD CONSTRAINT "family_requests_type_family_check"
  CHECK (
    (
      "type" = 'REGISTRATION'
      AND "before_data" = '{}'::jsonb
      AND (
        ("status" = 'PENDING' AND "family_id" IS NULL)
        OR ("status" = 'APPROVED' AND "family_id" IS NOT NULL)
        OR ("status" IN ('REJECTED', 'CANCELLED') AND "family_id" IS NULL)
      )
    )
    OR ("type" = 'UPDATE' AND "family_id" IS NOT NULL)
  );

DROP TYPE "RequestStatus";

CREATE UNIQUE INDEX "family_requests_pending_update_family_key"
ON "family_requests" ("family_id")
WHERE "type" = 'UPDATE' AND "status" = 'PENDING';
