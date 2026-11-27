import { z } from "zod";
import { passwordSchema } from "../../../common/schemas/common.schema.js";

export const familyLoginSchema = z.object({
  publicId: z.string().trim().min(1),
  password: z.string().min(1),
});

export const familyRefreshSchema = z.object({ refreshToken: z.string().min(1) });
export const familyPasswordSchema = z.object({ currentPassword: z.string().min(1), newPassword: passwordSchema });

