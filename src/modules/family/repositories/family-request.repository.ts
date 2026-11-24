import { prisma } from "../../../lib/prisma.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import {
  FamilyRequestStatus,
  FamilyRequestType,
} from "../../../generated/prisma/enums.js";
import * as familyMemberRepository from "./family-member.repository.js";
import * as familyRepository from "./family.repository.js";
import type { FamilyRequestApprovalData } from "../types/family-request.types.js";

type CreateFamilyRequestData = {
  type: FamilyRequestType;
  familyId?: bigint;
  requestedById: bigint;
  title: string;
  beforeData: Prisma.InputJsonValue;
  afterData: Prisma.InputJsonValue;
  justification?: string;
};

export const createFamilyRequest = async (data: CreateFamilyRequestData) =>
  prisma.familyRequest.create({
    data: {
      type: data.type,
      ...(data.familyId !== undefined && { familyId: data.familyId }),
      requestedById: data.requestedById,
      title: data.title,
      beforeData: data.beforeData,
      afterData: data.afterData,
      ...(data.justification !== undefined && { justification: data.justification }),
    },
  });

export const findFamilyRequestById = async (
  id: bigint,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) =>
  tx.familyRequest.findUnique({
    where: { id },
    include: {
      family: true,
      requestedBy: true,
      approvedBy: true,
      reviewedBy: true,
    },
  });

export const findPendingRequestByFamilyId = async (
  familyId: bigint,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) =>
  tx.familyRequest.findFirst({
    where: {
      familyId,
      type: FamilyRequestType.UPDATE,
      status: FamilyRequestStatus.PENDING,
    },
  });

export const findManyFamilyRequests = async (
  status?: FamilyRequestStatus,
  type?: FamilyRequestType,
) =>
  prisma.familyRequest.findMany({
    where: {
      ...(status !== undefined && { status }),
      ...(type !== undefined && { type }),
    },
    include: {
      family: true,
      requestedBy: true,
      approvedBy: true,
      reviewedBy: true,
    },
    orderBy: { id: "desc" },
  });

export const findRequestByStatus = async (status: FamilyRequestStatus) =>
  prisma.familyRequest.findMany({
    where: { status },
    include: {
      family: true,
      requestedBy: true,
      approvedBy: true,
      reviewedBy: true,
    },
    orderBy: { id: "asc" },
  });

const approvePendingFamilyRequest = async (
  id: bigint,
  familyId: bigint,
  reviewerId: bigint,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) => {
  const now = new Date();
  return tx.familyRequest.updateMany({
    where: { id, status: FamilyRequestStatus.PENDING },
    data: {
      status: FamilyRequestStatus.APPROVED,
      familyId,
      approvedById: reviewerId,
      approvedAt: now,
      reviewedById: reviewerId,
      reviewedAt: now,
    },
  });
};

export const approveFamilyRequest = async (
  id: bigint,
  reviewerId: bigint,
  approval: FamilyRequestApprovalData,
) =>
  prisma.$transaction(async (tx) => {
    const request = await findFamilyRequestById(id, tx);
    if (!request) throw new Error("Family request not found");
    if (request.status !== FamilyRequestStatus.PENDING) {
      throw new Error("Only pending requests can be approved");
    }
    if (request.type !== approval.type) {
      throw new Error("Approval data does not match the request type");
    }

    let familyId = request.familyId;
    if (approval.type === FamilyRequestType.REGISTRATION) {
      familyId = (await familyRepository.createFamilyAggregate(approval.family, tx)).id;
    } else {
      if (familyId === null || familyId !== approval.familyId) {
        throw new Error("Update request family does not match its snapshot");
      }
      const family =
        await familyRepository.findFamilyForRequestApproval(familyId, tx);
      if (!family) throw new Error("Family not found");
      await familyRepository.updateFamilyAggregate(
        familyId,
        approval.family,
        tx,
      );
      await familyMemberRepository.applyFamilyMemberChanges(
        familyId,
        request.requestedById,
        approval.members,
        tx,
      );
    }

    if (familyId === null) {
      throw new Error("Approved request must reference a family");
    }
    const result = await approvePendingFamilyRequest(
      id,
      familyId,
      reviewerId,
      tx,
    );
    if (result.count !== 1) throw new Error("Request is no longer pending");
    return findFamilyRequestById(id, tx);
  });

export const rejectPendingFamilyRequest = async (
  id: bigint,
  reviewerId: bigint,
  rejectionReason: string,
) =>
  prisma.familyRequest.updateMany({
    where: { id, status: FamilyRequestStatus.PENDING },
    data: {
      status: FamilyRequestStatus.REJECTED,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
      rejectionReason,
    },
  });

export const cancelPendingFamilyRequest = async (
  id: bigint,
  ownerId: bigint,
  reason: string,
) =>
  prisma.familyRequest.updateMany({
    where: {
      id,
      requestedById: ownerId,
      status: FamilyRequestStatus.PENDING,
    },
    data: {
      status: FamilyRequestStatus.CANCELLED,
      cancellationReason: reason,
    },
  });
