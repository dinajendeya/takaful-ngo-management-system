import type { Prisma } from "../../../generated/prisma/client.js";
import type { z } from "zod";
import type { FamilyStatus } from "../../../generated/prisma/enums.js";
import type { createEmployeeFamilySchema, createFamilySchema, rejectFamilySchema, updateFamilySchema } from "./family.schema.js";

export type CreateFamilyDto = z.infer<typeof createFamilySchema>;
export type CreateEmployeeFamilyDto = z.infer<typeof createEmployeeFamilySchema>;
export type UpdateFamilyDto = z.infer<typeof updateFamilySchema>;
export type RejectFamilyDto = z.infer<typeof rejectFamilySchema>;

export type CreateFamilyData = {
  branchId: bigint;
  createdById: bigint;
  passwordHash: string;
  primaryPhone: string;
  emergencyPhone?: string | undefined;
  originalAddress: Prisma.AddressCreateWithoutOriginalFamiliesInput;
  currentAddress: Prisma.AddressCreateWithoutCurrentFamiliesInput;
};

export type CreateFamilyAggregateData = {
  family: CreateFamilyData;
  assessment: Omit<Prisma.FamilyAssessmentUncheckedCreateInput, "familyId">;
  members: Omit<Prisma.FamilyMemberCreateManyInput, "familyId">[];
};

export type FamilyUpdateAggregateData = {
  family?: Prisma.FamilyUncheckedUpdateInput;
  assessment?: Prisma.FamilyAssessmentUncheckedUpdateInput;
  addresses?: {
    originalAddress?: Prisma.AddressUncheckedUpdateInput;
    currentAddress?: Prisma.AddressUncheckedUpdateInput;
  };
};

export type FamilyFilters = {
  status?: FamilyStatus;
  branchId?: bigint;
  primaryPhone?: string;
};
