import type { Prisma } from "../../../generated/prisma/client.js";
import { FamilyRequestStatus } from "../../../generated/prisma/enums.js";
import { prisma } from "../../../lib/prisma.js";
import * as familyMemberRepository from "./family-member.repository.js";
import * as familyRepository from "./family.repository.js";
import type { FamilyMemberChanges } from "../types/family-member.types.js";
import type { FamilyUpdateAggregateData } from "../types/family.types.js";

type CreateFamilyRequestData = {
  familyId: bigint;
  title: string;
  beforeData: Prisma.InputJsonValue;
  afterData: Prisma.InputJsonValue;
  justification?: string;
};

export const createFamilyRequest = async (data: CreateFamilyRequestData) =>
  prisma.familyRequest.create({ data });

export const findFamilyRequestById = async (id: bigint, tx: Prisma.TransactionClient | typeof prisma = prisma) =>
  tx.familyRequest.findUnique({
    where: { id },
    include: {
      family: { select: { id: true, publicId: true, branchId: true, primaryPhone: true, status: true } },
      reviewedBy: { select: { id: true, fullName: true, role: true } },
    },
  });

export const findPendingRequestByFamilyId = async (familyId: bigint) =>
  prisma.familyRequest.findFirst({ where: { familyId, status: FamilyRequestStatus.PENDING } });

export const findManyFamilyRequests = async (filter: { status?: FamilyRequestStatus; branchId?: bigint }, page = 1, limit = 20) => {
  const where: Prisma.FamilyRequestWhereInput = {
    ...(filter.status && { status: filter.status }),
    ...(filter.branchId && { family: { branchId: filter.branchId } }),
  };
  const [items, total] = await prisma.$transaction([
    prisma.familyRequest.findMany({
      where,
      include: { family: { select: { id: true, publicId: true, branchId: true, primaryPhone: true, status: true } }, reviewedBy: { select: { id: true, fullName: true, role: true } } },
      orderBy: { id: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.familyRequest.count({ where }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

export const findFamilyRequestsByFamilyId = async (familyId: bigint, page = 1, limit = 20) => {
  const where = { familyId };
  const [items, total] = await prisma.$transaction([
    prisma.familyRequest.findMany({
      where,
      include: { family: { select: { id: true, publicId: true, branchId: true, primaryPhone: true, status: true } }, reviewedBy: { select: { id: true, fullName: true, role: true } } },
      orderBy: { id: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.familyRequest.count({ where }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

export const approveFamilyRequest = async (id: bigint, reviewerId: bigint, familyId: bigint, family: FamilyUpdateAggregateData, members: FamilyMemberChanges) =>
  prisma.$transaction(async (tx) => {
    const request = await findFamilyRequestById(id, tx);
    if (!request) throw new Error("Family request not found");
    if (request.status !== FamilyRequestStatus.PENDING) throw new Error("Only pending requests can be approved");
    if (request.familyId !== familyId) throw new Error("Update request family does not match its snapshot");
    if (!(await familyRepository.findFamilyForRequestApproval(familyId, tx))) throw new Error("Family no longer exists");
    await familyRepository.updateFamilyAggregate(familyId, family, tx);
    await familyMemberRepository.applyFamilyMemberChanges(familyId, reviewerId, members, tx);
    const result = await tx.familyRequest.updateMany({
      where: { id, status: FamilyRequestStatus.PENDING },
      data: { status: FamilyRequestStatus.APPROVED, reviewedById: reviewerId, reviewedAt: new Date() },
    });
    if (result.count !== 1) throw new Error("Request is no longer pending");
    return findFamilyRequestById(id, tx);
  });

export const rejectPendingFamilyRequest = async (id: bigint, reviewerId: bigint, rejectionReason: string) =>
  prisma.familyRequest.updateMany({
    where: { id, status: FamilyRequestStatus.PENDING },
    data: { status: FamilyRequestStatus.REJECTED, reviewedById: reviewerId, reviewedAt: new Date(), rejectionReason },
  });

export const cancelPendingFamilyRequest = async (id: bigint, familyId: bigint, reason?: string) =>
  prisma.familyRequest.updateMany({
    where: { id, familyId, status: FamilyRequestStatus.PENDING },
    data: { status: FamilyRequestStatus.CANCELLED, ...(reason !== undefined && { cancellationReason: reason }) },
  });
