import { z } from "zod";
import { passwordSchema } from "../../../common/schemas/common.schema.js";

const emailSchema = z.email({ message: "Please provide a valid email address" }).trim().toLowerCase();

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ message: "Password is required" }).max(100, { message: "Password cannot exceed 100 characters" }),
});

export const refreshSchema = z.object({
  refreshToken: z.string({ message: "Refresh token is required" }),
});

export const logoutSchema = z.object({}).optional();

export const changePasswordSchema = z.object({
  currentPassword: z.string({ message: "Current password is required" }),
  newPassword: passwordSchema,
});

export const forgotPasswordSchema = z.object({ email: emailSchema });
export const resetPasswordSchema = z.object({
  token: z.string({ message: "Reset token is required" }),
  password: passwordSchema,
});
