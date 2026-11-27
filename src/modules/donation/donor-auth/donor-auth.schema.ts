import { z } from "zod";
import { DonorType } from "../../../generated/prisma/enums.js";

export const donorRegisterSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  contactPerson: z.string().min(1, "Contact person is required").max(255),
  phone: z.string().min(5, "Phone is too short").max(30),
  email: z.string().email("Invalid email address").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  donorType: z.enum(DonorType),
});

export const donorLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const donorRefreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const donorChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "New password must be at least 8 characters")
    .regex(/[A-Z]/, "New password must contain an uppercase letter")
    .regex(/[a-z]/, "New password must contain a lowercase letter")
    .regex(/[0-9]/, "New password must contain a number"),
});

export type DonorLoginDto = z.infer< typeof donorLoginSchema>;
export type DonorRegisterDto = z.infer< typeof donorRegisterSchema>;