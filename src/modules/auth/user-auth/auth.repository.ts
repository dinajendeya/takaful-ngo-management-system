import { prisma } from "../../../lib/prisma.js";

const authUserSelect = {
  id: true,
  branchId: true,
  role: true,
  isActive: true,
  mustChangePassword: true,
};

export const findByEmail = async (email: string) =>
  prisma.user.findUnique({
    where: { email },
    select: { ...authUserSelect, passwordHash: true },
  });

export const findByRefreshToken = async (refreshToken: string) =>
  prisma.user.findUnique({ where: { refreshToken }, select: authUserSelect });

export const saveRefreshToken = async (id: bigint, refreshToken: string) =>
  (await prisma.user.updateMany({
    where: { id, isActive: true },
    data: { refreshToken },
  })).count === 1;

export const updateLastLoginAt = async (id: bigint, lastLoginAt = new Date()) =>
  (await prisma.user.updateMany({
    where: { id, isActive: true },
    data: { lastLoginAt },
  })).count === 1;

export const rotateRefreshToken = async (id: bigint, currentToken: string, nextToken: string) =>
  (await prisma.user.updateMany({
    where: { id, isActive: true, refreshToken: currentToken },
    data: { refreshToken: nextToken },
  })).count === 1;

export const removeRefreshToken = async (id: bigint) =>
  prisma.user.update({ where: { id }, data: { refreshToken: null } });

export const findByIdWithPassword = async (id: bigint) =>
  prisma.user.findUnique({ where: { id }, select: { id: true, passwordHash: true } });

export const updatePassword = async (id: bigint, passwordHash: string) =>
  prisma.user.update({
    where: { id },
    data: { passwordHash, mustChangePassword: false, refreshToken: null },
    select: { id: true },
  });

export const getPasswordChangeStatus = async (id: bigint) =>
  prisma.user.findUnique({ where: { id }, select: { mustChangePassword: true } });
