import type { z } from "zod";
import type { createUserSchema, updateUserSchema } from "./user.schema.js";

export type CreateUserDto = z.infer<typeof createUserSchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
