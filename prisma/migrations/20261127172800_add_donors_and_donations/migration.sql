CREATE TYPE "DonorType" AS ENUM ('INDIVIDUAL', 'ORGANIZATION', 'COMPANY', 'NGO', 'GOVERNMENT');
CREATE TYPE "DonationType" AS ENUM ('MONETARY', 'ITEM', 'PARCEL');
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'RECEIVED', 'CANCELLED');

CREATE TABLE "donors" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "contact_person" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "refresh_token" TEXT,
    "donor_type" "DonorType" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "donations" (
    "id" BIGSERIAL NOT NULL,
    "donor_id" BIGINT NOT NULL,
    "donation_type" "DonationType" NOT NULL,
    "project_id" BIGINT,
    "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(15,2),
    "currency" VARCHAR(10),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "received_at" TIMESTAMPTZ(6),
    "note" TEXT,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "donors_email_key" ON "donors"("email");
CREATE UNIQUE INDEX "donors_refresh_token_key" ON "donors"("refresh_token");
CREATE INDEX "donations_donor_id_idx" ON "donations"("donor_id");
CREATE INDEX "donations_project_id_idx" ON "donations"("project_id");

ALTER TABLE "donations"
ADD CONSTRAINT "donations_donor_id_fkey"
FOREIGN KEY ("donor_id") REFERENCES "donors"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "donations"
ADD CONSTRAINT "donations_project_id_fkey"
FOREIGN KEY ("project_id") REFERENCES "projects"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
