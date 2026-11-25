import { Relationship } from "../../../generated/prisma/enums.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../lib/prisma.js";
import { parseId } from "../../../common/utils/parseId.js";
import type { FamilyMemberChanges } from "../types/family-member.types.js";

type CreateFamilyMemberData = Omit<
  Prisma.FamilyMemberCreateInput,
  "family" | "createdBy"
>;
export const createFamilyMember = async (
  familyId: bigint,
  createdById: bigint,
  data: CreateFamilyMemberData,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) =>
  tx.familyMember.create({
    data: {
      ...data,
      family: { connect: { id: familyId } },
      createdBy: { connect: { id: createdById } },
    },
  });

export const applyFamilyMemberChanges = async (
  familyId: bigint,
  createdById: bigint,
  changes: FamilyMemberChanges,
  tx: Prisma.TransactionClient,
) => {
  for (const member of changes.update) {
    const { id, ...data } = member;
    const parsedId = parseId(id);
    const existing = await tx.familyMember.findFirst({ where: { id: parsedId, familyId }, select: { id: true } });
    if (!existing) throw new Error("Family member not found in this family");
    await tx.familyMember.update({
      where: { id: parsedId },
      data: {
        ...data,
        ...(data.birthDate !== undefined && { birthDate: new Date(String(data.birthDate)) }),
      },
    });
  }

  for (const rawMemberId of changes.delete) {
    const memberId = parseId(rawMemberId);
    const member = await tx.familyMember.findFirst({
      where: { id: memberId, familyId },
      select: { id: true, relationship: true },
    });
    if (!member) throw new Error("Family member not found in this family");
    if (member.relationship === Relationship.HEAD) throw new Error("Family head cannot be deleted");
    await tx.familyMember.delete({ where: { id: member.id } });
  }

  for (const member of changes.create) {
    await tx.familyMember.create({
      data: {
        ...member,
        birthDate: new Date(String(member.birthDate)),
        familyId,
        createdById,
      },
    });
  }
};

export const findFamilyMemberById = async (id: bigint) =>
  prisma.familyMember.findUnique({ where: { id } });

export const findFamilyMemberByNationalId = async (nationalId: string) =>
  prisma.familyMember.findUnique({ where: { nationalId } });

export const findFamilyMembersByFamilyId = async (familyId: bigint) =>
  prisma.familyMember.findMany({
    where: { familyId },
    orderBy: { createdAt: "asc" },
  });

export const findManyFamilyMembersByFamilyId = async (familyId: bigint, page = 1, limit = 20) => {
  const where = { familyId };
  const [items, total] = await prisma.$transaction([
    prisma.familyMember.findMany({ where, orderBy: { createdAt: "asc" }, skip: (page - 1) * limit, take: limit }),
    prisma.familyMember.count({ where }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

export const findFamilyHead = async (familyId: bigint) =>
  prisma.familyMember.findFirst({
    where: { familyId, relationship: Relationship.HEAD },
  });

export const updateFamilyMember = async (
  id: bigint,
  data: Prisma.FamilyMemberUncheckedUpdateInput,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) =>
  tx.familyMember.update({
    where: { id },
    data,
  });

export const deleteFamilyMember = async (
  id: bigint,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) => tx.familyMember.delete({ where: { id } });

export const familyMemberExists = async (id: bigint) =>
  (await prisma.familyMember.findUnique({
    where: { id },
    select: { id: true },
  })) !== null;
