import type { z } from "zod";
import type { Prisma } from "../../../generated/prisma/client.js";
import type { HousingType } from "../../../generated/prisma/enums.js";
import type { createAssessmentSchema, updateAssessmentSchema } from "./family-assessment.schema.js";

export type CreateAssessmentDto = z.infer<typeof createAssessmentSchema>;
export type UpdateAssessmentDto = z.infer<typeof updateAssessmentSchema>;

export type CreateAssessmentData = {
  assessedById: bigint;
  monthlyFamilyIncome: Prisma.Decimal | number;
  rentCost?: Prisma.Decimal | number | null | undefined;
  housingType: HousingType;
  isDisplaced: boolean;
  isRegisteredInCamp: boolean;
  hasElectricity: boolean;
  hasInternet: boolean;
  notes?: string | undefined;
};
