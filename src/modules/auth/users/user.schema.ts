import { z } from "zod";
import { UserRole } from "../../../generated/prisma/enums.js";
import { phoneSchema } from "../../../common/schemas/common.schema.js";

const emailSchema = z.email({ message: "Please provide a valid email address" }).trim().toLowerCase();

export const userIdParamsSchema = z.object({
  id: z.string().regex(/^[1-9]\d*$/, { message: "User ID must be a positive integer" }),
});

export const createUserSchema = z.object({
  fullName: z.string({ message: "Full name is required" })
    .min(3, { message: "Full name must be at least 3 characters" })
    .max(150, { message: "Full name cannot exceed 150 characters" }),
  email: emailSchema,
  role: z.enum(UserRole),
  branchId: z.coerce.bigint().optional(),
  phone: phoneSchema.optional(),
});

export const updateUserSchema = createUserSchema
  .partial()
  .extend({ branchId: z.coerce.bigint().nullable().optional() })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });
