import { z } from "zod";
import { HousingType } from "../../../generated/prisma/enums.js";

const assessmentSchema = z.object({
  monthlyFamilyIncome: z.number({ message: "Monthly family income is required" }).min(0, { message: "Monthly family income cannot be negative" }),
  rentCost: z.number().min(0, { message: "Rent cost cannot be negative" }).nullable(),
  housingType: z.enum(HousingType),
  isDisplaced: z.boolean(),
  isRegisteredInCamp: z.boolean(),
  hasElectricity: z.boolean(),
  hasInternet: z.boolean(),
  notes: z.string().trim().max(1000, { message: "Notes cannot exceed 1000 characters" }).optional(),
});

export const createAssessmentSchema = assessmentSchema;
export const updateAssessmentSchema = assessmentSchema.partial();
