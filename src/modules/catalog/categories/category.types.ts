import type { z } from "zod";
import type { createCategorySchema, updateCategorySchema } from "./category.schema.js";
import { CategoryType } from "../../../generated/prisma/enums.js";

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;

