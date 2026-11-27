import { prisma } from "../../../lib/prisma.js";
import type { CreateDistributionData } from "./distribution.types.js";

const includeRelations = {
  family: { select: { id: true, publicId: true, primaryPhone: true } },
  branch: { select: { id: true, name: true } },
  project: { select: { id: true, name: true } },
  parcelTemplate: { select: { id: true, name: true } },
  distributedBy: { select: { id: true, fullName: true } },
};

export const create = async (data: CreateDistributionData) =>
  prisma.distribution.create({
    data: {
      familyId: data.familyId,
      branchId: data.branchId,
      projectId: data.projectId,
      parcelTemplateId: data.parcelTemplateId,
      distributedById: data.distributedById,
      ...(data.notes !== undefined && { notes: data.notes }),
    },
    include: includeRelations,
  });

export const findMany = async (branchId?: bigint) =>
  prisma.distribution.findMany({
    where: {
      ...(branchId !== undefined && { branchId }),
    },
    include: includeRelations,
    orderBy: { distributedAt: "desc" },
  });

export const findById = async (id: bigint) =>
  prisma.distribution.findUnique({
    where: { id },
    include: includeRelations,
  });

export const findProjectParcel = async (projectId: bigint, parcelTemplateId: bigint) =>
  prisma.projectParcel.findUnique({
    where: {
      projectId_parcelTemplateId: {
        projectId,
        parcelTemplateId,
      },
    },
  });