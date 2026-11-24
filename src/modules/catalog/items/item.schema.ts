import { z } from "zod";
import { Unit } from "../../../generated/prisma/enums.js";

const idString = z.string().regex(/^\d+$/, "Invalid id");

export const createItemSchema = z.object({
  categoryId: idString,
  name: z.string().min(1).max(150),
  unit: z.nativeEnum(Unit),
  description: z.string().max(5000).optional(),
});

export const updateItemSchema = createItemSchema.partial();

export const listItemsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  categoryId: idString.optional(),
  search: z.string().trim().min(1).max(150).optional(),
  includeDeleted: z.coerce.boolean().optional().default(false),
});