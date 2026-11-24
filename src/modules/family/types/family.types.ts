import type { Prisma } from "../../../generated/prisma/client.js";
import type { FamilyStatus, HousingType } from "../../../generated/prisma/enums.js";

export type CreateFamilyData = {
  branchId: bigint;
  createdById: bigint;
  passwordHash: string;
  primaryPhone: string;
  emergencyPhone?: string | undefined;
  originalAddress: Prisma.AddressCreateWithoutOriginalFamiliesInput;
  currentAddress: Prisma.AddressCreateWithoutCurrentFamiliesInput;
};

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

export type CreateFamilyAggregateData = {
  family: CreateFamilyData;
  assessment: CreateAssessmentData;
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
