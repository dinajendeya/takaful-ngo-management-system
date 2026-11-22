import { Relationship } from "../../../generated/prisma/enums.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../lib/prisma.js";

type CreateFamilyMemberData = Omit<
  Prisma.FamilyMemberCreateInput,
  "family" | "createdBy"
> & {
  familyId: bigint;
  createdById: bigint;
};

export const createFamilyMember = async (
  data: CreateFamilyMemberData,
) => {
  const { familyId, createdById, ...memberData } = data;
  return prisma.familyMember.create({
    data: {
      ...memberData,
      family: { connect: { id: familyId } },
      createdBy: { connect: { id: createdById } },
    },
  });
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

export const findFamilyHead = async (familyId: bigint) =>
  prisma.familyMember.findFirst({
    where: { familyId, relationship: Relationship.HEAD },
  });

export const updateFamilyMember = async (
  id: bigint,
  data: Prisma.FamilyMemberUncheckedUpdateInput,
) =>
  prisma.familyMember.update({
    where: { id },
    data,
  });
