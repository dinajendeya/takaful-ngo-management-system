/*
  Warnings:

  - You are about to drop the column `public_id` on the `branches` table. All the data in the column will be lost.
  - You are about to drop the column `public_id` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FamilyStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "Relationship" AS ENUM ('HEAD', 'SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER', 'BROTHER', 'SISTER', 'GRANDFATHER', 'GRANDMOTHER', 'OTHER');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('EMPLOYED', 'UNEMPLOYED', 'SELF_EMPLOYED', 'STUDENT', 'RETIRED', 'FREELANCER', 'OTHER');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('NONE', 'KINDERGARTEN', 'PRIMARY', 'PREPARATORY', 'SECONDARY', 'DIPLOMA', 'BACHELOR', 'MASTER', 'PHD');

-- CreateEnum
CREATE TYPE "HousingType" AS ENUM ('OWNER', 'RENT', 'HOSTING', 'TENT', 'FULL_HOUSE', 'PARTIALLY_DESTROYED', 'TOTALLY_DESTROYED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- DropIndex
DROP INDEX "branches_public_id_key";

-- DropIndex
DROP INDEX "users_public_id_key";

-- AlterTable
ALTER TABLE "branches" DROP COLUMN "public_id";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "public_id";

-- CreateTable
CREATE TABLE "addresses" (
    "id" BIGSERIAL NOT NULL,
    "governorate" "GazaGovernorate" NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "neighborhood" VARCHAR(200),
    "street" VARCHAR(200),
    "nearby_landmark" VARCHAR(200),
    "additional_details" TEXT,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "families" (
    "id" BIGSERIAL NOT NULL,
    "branch_id" BIGINT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "primary_phone" VARCHAR(30) NOT NULL,
    "emergency_phone" VARCHAR(30),
    "original_address_id" BIGINT NOT NULL,
    "current_address_id" BIGINT NOT NULL,
    "status" "FamilyStatus" NOT NULL DEFAULT 'PENDING',
    "created_by" BIGINT NOT NULL,
    "verified_by" BIGINT,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_members" (
    "id" BIGSERIAL NOT NULL,
    "family_id" BIGINT NOT NULL,
    "created_by" BIGINT NOT NULL,
    "national_id" VARCHAR(20) NOT NULL,
    "full_name" VARCHAR(200) NOT NULL,
    "gender" "Gender" NOT NULL,
    "birth_date" TIMESTAMP(3) NOT NULL,
    "phone" VARCHAR(30),
    "relationship" "Relationship" NOT NULL,
    "education_level" "EducationLevel",
    "education_major" VARCHAR(200),
    "education_fees" DECIMAL(10,2),
    "employment_status" "EmploymentStatus" NOT NULL DEFAULT 'UNEMPLOYED',
    "monthly_income" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "has_disability" BOOLEAN NOT NULL DEFAULT false,
    "disability_type" VARCHAR(150),
    "has_chronic_disease" BOOLEAN NOT NULL DEFAULT false,
    "disease_name" VARCHAR(150),
    "marital_status" "MaritalStatus" NOT NULL DEFAULT 'SINGLE',
    "is_orphan" BOOLEAN NOT NULL DEFAULT false,
    "is_based_in_gaza" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "family_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_assessments" (
    "id" BIGSERIAL NOT NULL,
    "family_id" BIGINT NOT NULL,
    "assessed_by" BIGINT NOT NULL,
    "monthly_family_income" DECIMAL(10,2) NOT NULL,
    "rent_cost" DECIMAL(10,2),
    "housing_type" "HousingType" NOT NULL,
    "is_displaced" BOOLEAN NOT NULL,
    "is_registered_in_camp" BOOLEAN NOT NULL,
    "has_electricity" BOOLEAN NOT NULL,
    "has_internet" BOOLEAN NOT NULL,
    "notes" TEXT,
    "assessed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "family_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "family_requests" (
    "id" BIGSERIAL NOT NULL,
    "family_id" BIGINT NOT NULL,
    "requested_by" BIGINT NOT NULL,
    "before_data" JSONB NOT NULL,
    "after_data" JSONB NOT NULL,
    "justification" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" BIGINT,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,

    CONSTRAINT "family_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "families_status_idx" ON "families"("status");

-- CreateIndex
CREATE INDEX "families_created_by_idx" ON "families"("created_by");

-- CreateIndex
CREATE INDEX "families_verified_by_idx" ON "families"("verified_by");

-- CreateIndex
CREATE INDEX "families_branch_id_idx" ON "families"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "family_members_national_id_key" ON "family_members"("national_id");

-- CreateIndex
CREATE INDEX "family_members_family_id_idx" ON "family_members"("family_id");

-- CreateIndex
CREATE INDEX "family_members_created_by_idx" ON "family_members"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "family_assessments_family_id_key" ON "family_assessments"("family_id");

-- CreateIndex
CREATE INDEX "family_assessments_assessed_by_idx" ON "family_assessments"("assessed_by");

-- CreateIndex
CREATE INDEX "family_requests_family_id_idx" ON "family_requests"("family_id");

-- CreateIndex
CREATE INDEX "family_requests_requested_by_idx" ON "family_requests"("requested_by");

-- CreateIndex
CREATE INDEX "family_requests_reviewed_by_idx" ON "family_requests"("reviewed_by");

-- CreateIndex
CREATE INDEX "family_requests_status_idx" ON "family_requests"("status");

-- AddForeignKey
ALTER TABLE "families" ADD CONSTRAINT "families_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "families" ADD CONSTRAINT "families_original_address_id_fkey" FOREIGN KEY ("original_address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "families" ADD CONSTRAINT "families_current_address_id_fkey" FOREIGN KEY ("current_address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "families" ADD CONSTRAINT "families_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "families" ADD CONSTRAINT "families_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_members" ADD CONSTRAINT "family_members_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_assessments" ADD CONSTRAINT "family_assessments_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_assessments" ADD CONSTRAINT "family_assessments_assessed_by_fkey" FOREIGN KEY ("assessed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_requests" ADD CONSTRAINT "family_requests_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_requests" ADD CONSTRAINT "family_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "family_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "family_requests" ADD CONSTRAINT "family_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
