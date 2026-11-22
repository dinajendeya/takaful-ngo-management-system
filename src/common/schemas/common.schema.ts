import { z } from "zod";

export const idSchema = z.string({ message: "ID is required" })
  .regex(/^[1-9]\d*$/, { message: "ID must be a positive integer" });

export const phoneSchema = z.string({ message: "Phone is required" })
  .regex(/^(\+970|0)?5\d{8}$/, { message: "Please provide a valid Palestinian mobile number" });

export const passwordSchema = z
  .string({ message: "Password is required" })
  .min(8, { message: "Password must be at least 8 characters" })
  .max(100, { message: "Password cannot exceed 100 characters" })
  .regex(/[A-Z]/, {message: "Password must contain at least one uppercase letter",})
  .regex(/[a-z]/, {message: "Password must contain at least one lowercase letter",})
  .regex(/\d/, {message: "Password must contain at least one number"})
  .regex(/[@$!%*?&_#.-]/, {message: "Password must contain at least one special character",})