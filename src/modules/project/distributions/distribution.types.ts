import type { z } from "zod";
import type { createDistributionSchema } from "./distribution.schema.js";

export type CreateDistributionDto = z.infer<typeof createDistributionSchema>;

export type CreateDistributionData = {
  familyId: bigint;
  branchId: bigint;
  projectId: bigint;
  parcelTemplateId: bigint;
  distributedById: bigint;
  notes?: string;
};
