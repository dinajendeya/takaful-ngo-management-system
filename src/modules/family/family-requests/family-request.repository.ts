import type { Prisma } from "../../../generated/prisma/client.js";
import { FamilyRequestStatus } from "../../../generated/prisma/enums.js";
import { prisma } from "../../../lib/prisma.js";
import { parseId } from "../../../common/utils/parseId.js";
import type { FamilyRequestApprovalData, FamilyRequestFilters } from "./family-request.types.js";

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

export const findManyFamilyRequests = async (filter: FamilyRequestFilters, page = 1, limit = 20) => {
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

export const approveFamilyRequest = async (id: bigint, data: FamilyRequestApprovalData) =>
  prisma.$transaction(async (tx) => {
    const family = await tx.family.findFirst({
      where: { id: data.familyId, deletedAt: null },
      select: { originalAddressId: true, currentAddressId: true },
    });
    if (!family) return { error: "family_not_found" as const };

    const memberIds = [...data.members.update.map((member) => parseId(member.id)), ...data.members.delete.map(parseId)];
    if (memberIds.length > 0) {
      const members = await tx.familyMember.findMany({
        where: { id: { in: memberIds }, familyId: data.familyId },
        select: { id: true },
      });
      if (members.length !== memberIds.length) return { error: "member_not_found" as const };
    }

    const approval = await tx.familyRequest.updateMany({
      where: { id, familyId: data.familyId, status: FamilyRequestStatus.PENDING },
      data: { status: FamilyRequestStatus.APPROVED, reviewedById: data.reviewerId, reviewedAt: new Date() },
    });
    if (approval.count !== 1) return { error: "request_not_pending" as const };

    if (data.family.family) {
      await tx.family.update({ where: { id: data.familyId }, data: data.family.family });
    }

    if (data.family.addresses?.originalAddress) {
      await tx.address.update({
        where: { id: family.originalAddressId },
        data: data.family.addresses.originalAddress,
      });
    }
    if (data.family.addresses?.currentAddress) {
      await tx.address.update({
        where: { id: family.currentAddressId },
        data: data.family.addresses.currentAddress,
      });
    }

    if (data.family.assessment) {
      await tx.familyAssessment.update({
        where: { familyId: data.familyId },
        data: data.family.assessment,
      });
    }

    for (const member of data.members.update) {
      const { id: memberId, ...memberData } = member;
      const parsedMemberId = parseId(memberId);
      await tx.familyMember.update({
        where: { id: parsedMemberId },
        data: {
          ...memberData,
          ...(memberData.birthDate !== undefined && { birthDate: new Date(String(memberData.birthDate)) }),
        },
      });
    }

    for (const memberId of data.members.delete) {
      const parsedMemberId = parseId(memberId);
      await tx.familyMember.delete({ where: { id: parsedMemberId } });
    }

    for (const member of data.members.create) {
      await tx.familyMember.create({
        data: {
          ...member,
          birthDate: new Date(String(member.birthDate)),
          familyId: data.familyId,
          createdById: data.reviewerId,
        },
      });
    }

    return { request: await findFamilyRequestById(id, tx) };
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
