import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../../lib/prisma.js";

export const findFamilyByPublicId = async (publicId: string) =>
  prisma.family.findFirst({
    where: { publicId, deletedAt: null },
    select: { id: true, publicId: true, passwordHash: true, mustChangePassword: true },
  });

export const findFamilyById = async (id: bigint) =>
  prisma.family.findFirst({
    where: { id, deletedAt: null },
    include: {
      branch: true,
      originalAddress: true,
      currentAddress: true,
      members: true,
      assessment: true,
    },
    omit: { passwordHash: true, refreshToken: true },
  });

export const findFamilyByIdForAuth = async (id: bigint) =>
  prisma.family.findFirst({ where: { id, deletedAt: null }, select: { id: true, passwordHash: true } });

export const findFamilyPasswordStatus = async (id: bigint) =>
  prisma.family.findFirst({ where: { id, deletedAt: null }, select: { mustChangePassword: true } });

export const updateFamilyAuth = async (id: bigint, data: Prisma.FamilyUncheckedUpdateInput) =>
  prisma.family.update({ where: { id }, data, select: { id: true } });

export const findFamilyByRefreshToken = async (refreshToken: string) =>
  prisma.family.findFirst({
    where: { refreshToken, deletedAt: null },
    select: { id: true, publicId: true, refreshToken: true, mustChangePassword: true },
  });

export const rotateFamilyRefreshToken = async (id: bigint, current: string, next: string) =>
  (await prisma.family.updateMany({
    where: { id, refreshToken: current, deletedAt: null },
    data: { refreshToken: next },
  })).count === 1;
