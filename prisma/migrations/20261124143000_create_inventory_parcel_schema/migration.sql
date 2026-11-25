CREATE TYPE "category" AS ENUM (
  'FOOD',
  'CLEANING',
  'BLANKETS',
  'SCHOOL',
  'ELECTRONICS',
  'MEDICAL',
  'MONETARY',
  'COURSE'
);

CREATE TYPE "unit" AS ENUM (
  'PIECE',
  'KILOGRAM',
  'GRAM',
  'LITER',
  'MILLILITER',
  'BOX',
  'PACKAGE',
  'SET',
  'PAIR',
  'METER',
  'ROLL',
  'CARTON',
  'BAG'
);

CREATE TYPE "parcel_template_status" AS ENUM ('DRAFT');

CREATE TABLE "categories" (
  "id" BIGSERIAL NOT NULL,
  "name" "category" NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "items" (
  "id" BIGSERIAL NOT NULL,
  "category_id" BIGINT NOT NULL,
  "name" VARCHAR(150) NOT NULL,
  "unit" "unit" NOT NULL,
  "description" TEXT,
  "deleted_at" TIMESTAMP(3),
  CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inventories" (
  "id" BIGSERIAL NOT NULL,
  "name" VARCHAR(150) NOT NULL,
  "branch_id" BIGINT NOT NULL,
  "location" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "created_by_id" BIGINT NOT NULL,
  CONSTRAINT "inventories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "inventory_items" (
  "inventory_id" BIGINT NOT NULL,
  "item_id" BIGINT NOT NULL,
  "quantity" DECIMAL(12,3) NOT NULL,
  "low_stock_threshold" DECIMAL(12,3),
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("inventory_id", "item_id"),
  CONSTRAINT "inventory_items_quantity_check" CHECK ("quantity" >= 0),
  CONSTRAINT "inventory_items_low_stock_threshold_check" CHECK ("low_stock_threshold" IS NULL OR "low_stock_threshold" >= 0)
);

CREATE TABLE "parcel_templates" (
  "id" BIGSERIAL NOT NULL,
  "name" VARCHAR(150) NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" "parcel_template_status" NOT NULL DEFAULT 'DRAFT',
  "created_by_id" BIGINT NOT NULL,
  CONSTRAINT "parcel_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "parcel_items" (
  "parcel_template_id" BIGINT NOT NULL,
  "item_id" BIGINT NOT NULL,
  "quantity" DECIMAL(12,3) NOT NULL,
  CONSTRAINT "parcel_items_pkey" PRIMARY KEY ("parcel_template_id", "item_id"),
  CONSTRAINT "parcel_items_quantity_check" CHECK ("quantity" > 0)
);

CREATE UNIQUE INDEX "categories_active_name_key"
ON "categories" ("name")
WHERE "deleted_at" IS NULL;

CREATE INDEX "items_category_id_idx" ON "items" ("category_id");
CREATE UNIQUE INDEX "inventories_branch_id_name_key" ON "inventories" ("branch_id", "name");
CREATE INDEX "inventories_created_by_id_idx" ON "inventories" ("created_by_id");
CREATE INDEX "parcel_templates_created_by_id_idx" ON "parcel_templates" ("created_by_id");

ALTER TABLE "items"
ADD CONSTRAINT "items_category_id_fkey"
FOREIGN KEY ("category_id") REFERENCES "categories" ("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inventories"
ADD CONSTRAINT "inventories_branch_id_fkey"
FOREIGN KEY ("branch_id") REFERENCES "branches" ("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inventories"
ADD CONSTRAINT "inventories_created_by_id_fkey"
FOREIGN KEY ("created_by_id") REFERENCES "users" ("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inventory_items"
ADD CONSTRAINT "inventory_items_inventory_id_fkey"
FOREIGN KEY ("inventory_id") REFERENCES "inventories" ("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inventory_items"
ADD CONSTRAINT "inventory_items_item_id_fkey"
FOREIGN KEY ("item_id") REFERENCES "items" ("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "parcel_templates"
ADD CONSTRAINT "parcel_templates_created_by_id_fkey"
FOREIGN KEY ("created_by_id") REFERENCES "users" ("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "parcel_items"
ADD CONSTRAINT "parcel_items_parcel_template_id_fkey"
FOREIGN KEY ("parcel_template_id") REFERENCES "parcel_templates" ("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "parcel_items"
ADD CONSTRAINT "parcel_items_item_id_fkey"
FOREIGN KEY ("item_id") REFERENCES "items" ("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
