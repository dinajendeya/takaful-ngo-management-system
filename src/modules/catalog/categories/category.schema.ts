import { z } from "zod";
import { CategoryType } from "../../../generated/prisma/enums.js"
export const createCategorySchema = z.object({
  name: z.enum(CategoryType),
  description: z.string().max(5000).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();