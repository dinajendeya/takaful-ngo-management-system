import { FamilyStatus, HousingType } from "../../../generated/prisma/enums.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../lib/prisma.js";

const familyInclude = {
  branch: true,
  originalAddress: true,
  currentAddress: true,
  members: true,
  assessment: true,
} as const;

type CreateFamilyData = {
  branchId: bigint;
  createdById: bigint;
  passwordHash: string;
  primaryPhone: string;
  emergencyPhone?: string;
  originalAddress: Prisma.AddressCreateWithoutOriginalFamiliesInput;
  currentAddress: Prisma.AddressCreateWithoutCurrentFamiliesInput;
};

type CreateAssessmentData = {
  familyId: bigint;
  assessedById: bigint;
  monthlyFamilyIncome: Prisma.Decimal | number;
  rentCost?: Prisma.Decimal | number | null;
  housingType: HousingType;
  isDisplaced: boolean;
  isRegisteredInCamp: boolean;
  hasElectricity: boolean;
  hasInternet: boolean;
  notes?: string;
};

export const createFamily = async (data: CreateFamilyData) =>
  prisma.family.create({
    data: {
      passwordHash: data.passwordHash,
      primaryPhone: data.primaryPhone,
      ...(data.emergencyPhone && { emergencyPhone: data.emergencyPhone }),
      branch: { connect: { id: data.branchId } },
      createdBy: { connect: { id: data.createdById } },
      originalAddress: { create: data.originalAddress },
      currentAddress: { create: data.currentAddress },
    },
    include: familyInclude,
  });

export const findFamilyById = async (id: bigint) =>
  prisma.family.findUnique({ where: { id }, include: familyInclude });

export const findFamilyByPhone = async (primaryPhone: string) =>
  prisma.family.findUnique({ where: { primaryPhone }, include: familyInclude });

export const findManyFamilies = async () =>
  prisma.family.findMany({
    include: familyInclude,
    orderBy: { createdAt: "desc" },
  });

export const updateFamily = async (
  id: bigint,
  data: Prisma.FamilyUncheckedUpdateInput,
) =>
  prisma.family.update({
    where: { id },
    data,
    include: familyInclude,
  });

export const verifyFamily = async (id: bigint, verifiedById: bigint) =>
  prisma.family.update({
    where: { id },
    data: {
      status: FamilyStatus.VERIFIED,
      verifiedById,
      verifiedAt: new Date(),
    },
    include: familyInclude,
  });

export const rejectFamily = async (id: bigint, verifiedById: bigint) =>
  prisma.family.update({
    where: { id },
    data: {
      status: FamilyStatus.REJECTED,
      verifiedById,
      verifiedAt: new Date(),
    },
    include: familyInclude,
  });

export const createAssessment = async (data: CreateAssessmentData) =>
  prisma.familyAssessment.create({
    data: {
      monthlyFamilyIncome: data.monthlyFamilyIncome,
      ...(data.rentCost !== undefined && { rentCost: data.rentCost }),
      housingType: data.housingType,
      isDisplaced: data.isDisplaced,
      isRegisteredInCamp: data.isRegisteredInCamp,
      hasElectricity: data.hasElectricity,
      hasInternet: data.hasInternet,
      ...(data.notes !== undefined && { notes: data.notes }),
      family: { connect: { id: data.familyId } },
      assessedBy: { connect: { id: data.assessedById } },
    },
  });

export const findAssessmentByFamilyId = async (familyId: bigint) =>
  prisma.familyAssessment.findUnique({ where: { familyId } });

export const updateAssessment = async (
  id: bigint,
  data: Prisma.FamilyAssessmentUncheckedUpdateInput,
) =>
  prisma.familyAssessment.update({
    where: { id },
    data,
  });