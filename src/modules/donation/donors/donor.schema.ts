import { z } from "zod";
import { DonorType } from "../../../generated/prisma/enums.js";

// Donor updating their own profile
export const updateDonorProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  contactPerson: z.string().min(1).max(255).optional(),
  phone: z.string().min(5).max(30).optional(),
});

// Admin updating a donor's profile
export const adminUpdateDonorSchema = updateDonorProfileSchema.extend({
  donorType: z.enum(Object.values(DonorType) as [string, ...string[]]).optional(),
  notes: z.string().max(5000).optional(),
});