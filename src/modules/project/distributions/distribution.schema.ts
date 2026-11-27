import { z } from "zod";

const idString = z.string().regex(/^\d+$/, "Invalid id");

export const createDistributionSchema = z.object({
  familyId: idString,
  projectId: idString,
  parcelTemplateId: idString,
  notes: z.string().max(5000).optional(),
});