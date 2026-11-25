import { FamilyStatus } from "../../../generated/prisma/enums.js";
import { randomUUID } from "node:crypto";
import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../lib/prisma.js";
import type {
  CreateAssessmentData,
  CreateFamilyAggregateData,
  CreateFamilyData,
  FamilyFilters,
  FamilyUpdateAggregateData,
} from "../types/family.types.js";

const familyInclude = {
  branch: true,
  originalAddress: true,
  currentAddress: true,
  members: true,
  assessment: true,
} as const;

type FamilyUpdateData = Prisma.FamilyUncheckedUpdateInput;
type AssessmentUpdateData = Prisma.FamilyAssessmentUncheckedUpdateInput;
type AddressUpdateData = Prisma.AddressUncheckedUpdateInput;

export const transaction = <T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
) => prisma.$transaction(callback);

export const createFamily = async (data: CreateFamilyData) =>
  prisma.$transaction(async (tx) => {
    const family = await tx.family.create({
      data: {
        publicId: `FAM-TMP-${randomUUID().slice(0, 8)}`,
        passwordHash: data.passwordHash,
        mustChangePassword: true,
        primaryPhone: data.primaryPhone,
        ...(data.emergencyPhone !== undefined && { emergencyPhone: data.emergencyPhone }),
        branch: { connect: { id: data.branchId } },
        createdBy: { connect: { id: data.createdById } },
        originalAddress: { create: data.originalAddress },
        currentAddress: { create: data.currentAddress },
      },
    });
    return tx.family.update({ where: { id: family.id }, data: { publicId: `FAM-${family.id.toString().padStart(6, "0")}` }, include: familyInclude, omit: { passwordHash: true, refreshToken: true } });
  });

const createFamilyAggregateWithClient = async (
  tx: Prisma.TransactionClient | typeof prisma,
  data: CreateFamilyAggregateData,
) => {
  const family = await tx.family.create({
    data: {
      publicId: `FAM-TMP-${randomUUID().slice(0, 8)}`,
      passwordHash: data.family.passwordHash,
      primaryPhone: data.family.primaryPhone,
      ...(data.family.emergencyPhone !== undefined && { emergencyPhone: data.family.emergencyPhone }),
      branch: { connect: { id: data.family.branchId } },
      createdBy: { connect: { id: data.family.createdById } },
      originalAddress: { create: data.family.originalAddress },
      currentAddress: { create: data.family.currentAddress },
    },
  });
  await tx.family.update({ where: { id: family.id }, data: { publicId: `FAM-${family.id.toString().padStart(6, "0")}` } });

  await tx.familyAssessment.create({
    data: {
      ...data.assessment,
      familyId: family.id,
    },
  });

  if (data.members.length > 0) {
    await tx.familyMember.createMany({
      data: data.members.map((member) => ({
        ...member,
        familyId: family.id,
      })),
    });
  }

  return tx.family.findUniqueOrThrow({
    where: { id: family.id },
    include: familyInclude,
    omit: { passwordHash: true, refreshToken: true },
  });
};

export const createFamilyAggregate = async (
  data: CreateFamilyAggregateData,
  tx?: Prisma.TransactionClient,
) =>
  tx
    ? createFamilyAggregateWithClient(tx, data)
    : prisma.$transaction((transactionClient) =>
        createFamilyAggregateWithClient(transactionClient, data),
      );

export const findFamilyById = async (id: bigint) =>
  prisma.family.findFirst({ where: { id, deletedAt: null }, include: familyInclude, omit: { passwordHash: true, refreshToken: true } });

export const findFamilyForRequestApproval = async (
  id: bigint,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) => tx.family.findFirst({ where: { id, deletedAt: null }, include: familyInclude, omit: { passwordHash: true, refreshToken: true } });

export const findFamilyWithEverything = async (
  familyId: bigint,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) =>
  tx.family.findFirst({
    where: { id: familyId, deletedAt: null },
    include: familyInclude,
    omit: { passwordHash: true, refreshToken: true },
  });

export const findFamilyByPhone = async (primaryPhone: string) =>
  prisma.family.findFirst({ where: { primaryPhone, deletedAt: null }, include: familyInclude, omit: { passwordHash: true, refreshToken: true } });

export const findFamilyByEmergencyPhone = async (emergencyPhone: string) =>
  prisma.family.findFirst({
    where: { emergencyPhone, deletedAt: null },
    include: familyInclude,
    omit: { passwordHash: true, refreshToken: true },
  });

export const findManyFamilies = async (
  data: FamilyFilters = {},
  page = 1,
  limit = 20,
) => {
  const where: Prisma.FamilyWhereInput = {
    deletedAt: null,
    ...(data.status && { status: data.status }),
    ...(data.branchId && { branchId: data.branchId }),
    ...(data.primaryPhone && { primaryPhone: { contains: data.primaryPhone } }),
  };
  const [items, total] = await prisma.$transaction([
    prisma.family.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: familyInclude,
      omit: { passwordHash: true, refreshToken: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.family.count({ where }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

export const updateFamily = async (
  id: bigint,
  data: FamilyUpdateData,
) =>
  prisma.family.update({
    where: { id },
    data,
    include: familyInclude,
    omit: { passwordHash: true, refreshToken: true },
  });

export const updateFamilyPartial = async (
  id: bigint,
  data: FamilyUpdateData,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) =>
  tx.family.update({
    where: { id },
    data,
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
    omit: { passwordHash: true, refreshToken: true },
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
    omit: { passwordHash: true, refreshToken: true },
  });

export const createAssessment = async (
  data: CreateAssessmentData & { familyId: bigint },
) =>
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

export const findBranch = async (id: bigint) => prisma.branch.findUnique({ where: { id } });

export const findFamilyByPublicId = async (publicId: string) =>
  prisma.family.findFirst({ where: { publicId, deletedAt: null }, select: { id: true, publicId: true, passwordHash: true, mustChangePassword: true } });

export const findFamilyByIdForAuth = async (id: bigint) =>
  prisma.family.findFirst({ where: { id, deletedAt: null }, select: { id: true, passwordHash: true } });

export const findFamilyPasswordStatus = async (id: bigint) =>
  prisma.family.findFirst({ where: { id, deletedAt: null }, select: { mustChangePassword: true } });

export const updateFamilyAuth = async (id: bigint, data: Prisma.FamilyUncheckedUpdateInput) =>
  prisma.family.update({ where: { id }, data, select: { id: true } });

export const findFamilyByRefreshToken = async (refreshToken: string) =>
  prisma.family.findFirst({ where: { refreshToken, deletedAt: null }, select: { id: true, publicId: true, refreshToken: true, mustChangePassword: true } });

export const rotateFamilyRefreshToken = async (id: bigint, current: string, next: string) =>
  (await prisma.family.updateMany({ where: { id, refreshToken: current, deletedAt: null }, data: { refreshToken: next } })).count === 1;

export const softDeleteFamily = async (id: bigint) =>
  prisma.family.update({ where: { id }, data: { deletedAt: new Date() }, omit: { passwordHash: true, refreshToken: true } });

export const updateAssessmentByFamilyId = async (
  familyId: bigint,
  data: AssessmentUpdateData,
  tx: Prisma.TransactionClient | typeof prisma = prisma,
) =>
  tx.familyAssessment.update({
    where: { familyId },
    data,
  });

export const updateFamilyAddresses = async (
  familyId: bigint,
  data: {
    originalAddress?: AddressUpdateData;
    currentAddress?: AddressUpdateData;
  },
  tx?: Prisma.TransactionClient,
) => {
  if (tx) return updateFamilyAddressesWithClient(tx, familyId, data);
  return prisma.$transaction((transactionClient) =>
    updateFamilyAddressesWithClient(transactionClient, familyId, data),
  );
};


const updateFamilyAddressesWithClient = async (
  tx: Prisma.TransactionClient | typeof prisma,
  familyId: bigint,
  data: {
    originalAddress?: AddressUpdateData;
    currentAddress?: AddressUpdateData;
  },
) => {
  const family = await tx.family.findUniqueOrThrow({
    where: { id: familyId },
    select: {
      originalAddressId: true,
      currentAddressId: true,
    },
  });

  if (data.originalAddress) {
    await tx.address.update({
      where: { id: family.originalAddressId },
      data: data.originalAddress,
    });
  }

  if (data.currentAddress) {
    await tx.address.update({
      where: { id: family.currentAddressId },
      data: data.currentAddress,
    });
  }
};

const updateFamilyAggregateWithClient = async (
  familyId: bigint,
  data: FamilyUpdateAggregateData,
  tx: Prisma.TransactionClient | typeof prisma,
) => {
  if (data.family) await updateFamilyPartial(familyId, data.family, tx);
  if (data.addresses) {
    await updateFamilyAddressesWithClient(tx, familyId, data.addresses);
  }
  if (data.assessment) {
    await updateAssessmentByFamilyId(familyId, data.assessment, tx);
  }
};

export const updateFamilyAggregate = async (
  familyId: bigint,
  data: FamilyUpdateAggregateData,
  tx?: Prisma.TransactionClient,
) => {
  if (tx) return updateFamilyAggregateWithClient(familyId, data, tx);
  return prisma.$transaction((transactionClient) =>
    updateFamilyAggregateWithClient(familyId, data, transactionClient),
  );
};
