import { z } from "zod";
import { idSchema } from "../../../common/schemas/common.schema.js";

export const createInventorySchema = z.object({
  name: z.string().min(1).max(150),
  branchId: idSchema,
  location: z.string().optional(),
});

export const updateInventorySchema = z.object({
  name: z.string().min(1).max(150).optional(),
  location: z.string().optional(),
});