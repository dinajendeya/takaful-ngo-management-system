CREATE TABLE "inventory_parcels" (
    "inventory_id" BIGINT NOT NULL,
    "parcel_template_id" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_parcels_pkey" PRIMARY KEY ("inventory_id", "parcel_template_id"),
    CONSTRAINT "inventory_parcels_quantity_check" CHECK ("quantity" >= 0)
);

CREATE INDEX "inventory_parcels_parcel_template_id_idx"
ON "inventory_parcels"("parcel_template_id");

ALTER TABLE "inventory_parcels"
ADD CONSTRAINT "inventory_parcels_inventory_id_fkey"
FOREIGN KEY ("inventory_id") REFERENCES "inventories"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "inventory_parcels"
ADD CONSTRAINT "inventory_parcels_parcel_template_id_fkey"
FOREIGN KEY ("parcel_template_id") REFERENCES "parcel_templates"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
