import { Relationship } from "../../../generated/prisma/enums.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../lib/prisma.js";

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
