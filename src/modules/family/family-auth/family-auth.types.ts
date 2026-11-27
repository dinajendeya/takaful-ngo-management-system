import type { z } from "zod";
import type { familyLoginSchema, familyPasswordSchema, familyRefreshSchema } from "./family-auth.schema.js";

export type FamilyLoginDto = z.infer<typeof familyLoginSchema>;
export type FamilyRefreshDto = z.infer<typeof familyRefreshSchema>;
export type FamilyPasswordDto = z.infer<typeof familyPasswordSchema>;
