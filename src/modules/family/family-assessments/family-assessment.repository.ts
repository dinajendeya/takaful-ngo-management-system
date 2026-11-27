import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../lib/prisma.js";
import type { CreateAssessmentData } from "./family-assessment.types.js";

export const createAssessment = async (data: CreateAssessmentData & { familyId: bigint }) =>
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

export const updateAssessmentByFamilyId = async (
  familyId: bigint,
  data: Prisma.FamilyAssessmentUncheckedUpdateInput,
) => prisma.familyAssessment.update({ where: { familyId }, data });
