import { z } from "zod";
import { GazaGovernorate } from "../../../generated/prisma/enums.js";
import { idSchema, phoneSchema, passwordSchema } from "../../../common/schemas/common.schema.js";

const addressSchema = z.object({
  governorate: z.enum(GazaGovernorate),
  city: z.string({ message: "City is required" }).trim().min(3, { message: "City must be at least 3 charachters" })
  .max(100, { message: "City cannot exceed 100 characters" }),
  neighborhood: z.string().trim().min(3, { message: "neighborhood must be 3 charachters" })
  .max(200, { message: "Neighborhood cannot exceed 200 characters" }),
  street: z.string().trim().max(200, { message: "Street cannot exceed 200 characters" }).optional(),
  nearbyLandmark: z.string().trim().max(200, { message: "Nearby landmark cannot exceed 200 characters" }).optional(),
  additionalDetails: z.string().trim().max(1000, { message: "Additional details cannot exceed 1000 characters" }).optional(),
});

export const createFamilySchema = z.object({
  branchId: idSchema,
  primaryPhone: phoneSchema,
  emergencyPhone: phoneSchema.optional(),
  password: passwordSchema,
  originalAddress: addressSchema,
  currentAddress: addressSchema,
});

export const createEmployeeFamilySchema = createFamilySchema.omit({ password: true });

export const updateFamilySchema = createFamilySchema.partial();

export const rejectFamilySchema = z.object({
  rejectionReason: z.string({ message: "Rejection reason is required" }).trim()
    .min(5, { message: "Rejection reason must be at least 5 characters" }).max(1000, { message: "Rejection reason cannot exceed 1000 characters" }),
});
