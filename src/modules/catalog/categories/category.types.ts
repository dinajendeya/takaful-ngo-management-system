import type { z } from "zod";
import type { createCategorySchema, updateCategorySchema } from "./category.schema.js";

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;

