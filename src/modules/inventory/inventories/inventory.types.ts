import type { z } from "zod";
import type { createInventorySchema, updateInventorySchema } from "./inventory.schema.js";

export type CreateInventoryDto = z.infer<typeof createInventorySchema>;
export type UpdateInventoryDto = z.infer<typeof updateInventorySchema>;

export type CreateInventoryData = {
  name: string;
  branchId: bigint;
  createdById: bigint;
  location?: string;
};

export type UpdateInventoryData = {
  name?: string;
  location?: string;
};