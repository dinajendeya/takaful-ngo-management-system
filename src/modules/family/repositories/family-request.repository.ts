import { prisma } from "../../../lib/prisma.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import { RequestStatus } from "../../../generated/prisma/enums.js";

type CreateFamilyRequestData = {
  familyId: bigint;
  requestedById: bigint;
  title: string;
  beforeData: Prisma.InputJsonValue;
  afterData: Prisma.InputJsonValue;
  justification?: string;
};

export const createFamilyRequest = async (data: CreateFamilyRequestData) =>
  prisma.familyRequest.create({
    data: {
      familyId: data.familyId,
      requestedById: data.requestedById,
      title: data.title,
      beforeData: data.beforeData,
      afterData: data.afterData,
      ...(data.justification && { justification: data.justification }),
    },
  });

export const findFamilyRequestById = async (id: bigint) =>
  prisma.familyRequest.findUnique({
    where: { id },
    include: { family: true, requestedBy: true, reviewedBy: true },
  });

export const findManyFamilyRequests = async () =>
  prisma.familyRequest.findMany({
    include: { family: true, requestedBy: true, reviewedBy: true },
    orderBy: { id: "desc" },
  });

export const findRequestByStatus = async (status: RequestStatus) =>
  prisma.familyRequest.findMany({
    where: { status },
    include: { family: true, requestedBy: true, reviewedBy: true },
    orderBy: { id: "asc" },
  });

export const updateFamilyRequest = async (
  id: bigint,
  data: Prisma.FamilyRequestUncheckedUpdateInput,
) =>
  prisma.familyRequest.update({
    where: { id },
    data,
  });
