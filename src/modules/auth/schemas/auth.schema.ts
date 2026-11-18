import { z } from "zod";
import { UserRole } from "../../../generated/prisma/enums.js";

const passwordSchema = z
  .string({ message: "Password is required" })
  .min(8, { message: "Password must be at least 8 characters" })
  .max(100, { message: "Password cannot exceed 100 characters" })
  .regex(/[A-Z]/, {message: "Password must contain at least one uppercase letter",})
  .regex(/[a-z]/, {message: "Password must contain at least one lowercase letter",})
  .regex(/\d/, {message: "Password must contain at least one number"})
  .regex(/[@$!%*?&_#.-]/, {message: "Password must contain at least one special character",});

export const loginSchema = z.object({
  email: z.email({message: "Please provide a valid email address",}),
  password: z.string({message: "Password is required",})
});

export const createUserSchema = z.object({
  fullName: z.string({ message: "Full name is required" })
    .min(3, { message: "Full name must be at least 3 characters" })
    .max(150, { message: "Full name cannot exceed 150 characters" }),

  email: z.email({ message: "Please provide a valid email address"}),
  password: passwordSchema,
  role: z.enum(UserRole),
  branchId: z.coerce.bigint().optional(),
  phone: z.string().regex(/^(\+970|0)?5\d{8}$/, {message: "Please provide a valid Palestinian mobile number",}).optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string({ message: "Current password is required",}),
  newPassword: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z.email({ message: "Please provide a valid email address",}),
});

export const resetPasswordSchema = z.object({
  token: z.string({message: "Reset token is required"}),
  password: passwordSchema,
});

export type LoginDto = z.infer<typeof loginSchema>;
export type CreateUserDto = z.infer<typeof createUserSchema>;
export type ChangePasswordDto = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;