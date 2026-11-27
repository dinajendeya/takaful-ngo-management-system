ALTER TYPE "UserRole" ADD VALUE 'DISTRIBUTOR';

CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

CREATE TABLE "projects" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "project_parcels" (
    "project_id" BIGINT NOT NULL,
    "parcel_template_id" BIGINT NOT NULL,
    "target_quantity" INTEGER NOT NULL,
    "available_quantity" INTEGER NOT NULL,

    CONSTRAINT "project_parcels_pkey" PRIMARY KEY ("project_id", "parcel_template_id"),
    CONSTRAINT "project_parcels_target_quantity_check" CHECK ("target_quantity" >= 0),
    CONSTRAINT "project_parcels_available_quantity_check" CHECK ("available_quantity" >= 0)
);

CREATE TABLE "distributions" (
    "id" BIGSERIAL NOT NULL,
    "family_id" BIGINT NOT NULL,
    "branch_id" BIGINT NOT NULL,
    "project_id" BIGINT NOT NULL,
    "parcel_template_id" BIGINT NOT NULL,
    "distributed_by" BIGINT NOT NULL,
    "distributed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "distributions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "projects_created_by_idx" ON "projects"("created_by");
CREATE INDEX "project_parcels_parcel_template_id_idx" ON "project_parcels"("parcel_template_id");
CREATE UNIQUE INDEX "distributions_family_id_project_id_key" ON "distributions"("family_id", "project_id");
CREATE INDEX "distributions_project_id_idx" ON "distributions"("project_id");
CREATE INDEX "distributions_branch_id_idx" ON "distributions"("branch_id");
CREATE INDEX "distributions_parcel_template_id_idx" ON "distributions"("parcel_template_id");
CREATE INDEX "distributions_distributed_by_idx" ON "distributions"("distributed_by");

ALTER TABLE "projects"
ADD CONSTRAINT "projects_created_by_fkey"
FOREIGN KEY ("created_by") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "project_parcels"
ADD CONSTRAINT "project_parcels_project_id_fkey"
FOREIGN KEY ("project_id") REFERENCES "projects"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "project_parcels"
ADD CONSTRAINT "project_parcels_parcel_template_id_fkey"
FOREIGN KEY ("parcel_template_id") REFERENCES "parcel_templates"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "distributions"
ADD CONSTRAINT "distributions_family_id_fkey"
FOREIGN KEY ("family_id") REFERENCES "families"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "distributions"
ADD CONSTRAINT "distributions_branch_id_fkey"
FOREIGN KEY ("branch_id") REFERENCES "branches"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "distributions"
ADD CONSTRAINT "distributions_project_id_fkey"
FOREIGN KEY ("project_id") REFERENCES "projects"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "distributions"
ADD CONSTRAINT "distributions_parcel_template_id_fkey"
FOREIGN KEY ("parcel_template_id") REFERENCES "parcel_templates"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "distributions"
ADD CONSTRAINT "distributions_distributed_by_fkey"
FOREIGN KEY ("distributed_by") REFERENCES "users"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
