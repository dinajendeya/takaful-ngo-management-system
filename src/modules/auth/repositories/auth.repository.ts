import { prisma } from "../../../lib/prisma.js";
import type { CreateUserDto } from "../schemas/auth.schema.js";

const userSelect = {
  id: true,
  branchId: true,
  fullName: true,
  email: true,
  role: true,
  phone: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  branch: { select: { id: true, name: true, governorate: true, address: true, phone: true } },
} as const;

export const create = async (data: CreateUserDto & {passwordHash: string}) =>
  prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
      ...(data.branchId && { branchId: data.branchId }),
      ...(data.phone && { phone: data.phone }),
    },
    select: userSelect,
  });

export const findMany = async () => 
  prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: "desc" },
  });

export const findById = async (id: bigint) =>
  prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });

export const findByEmail = async (email: string) =>
  prisma.user.findUnique({
    where: { email },
    select: { ...userSelect, passwordHash: true },
  });

export const findByIdWithPassword = async (id: bigint) =>
  prisma.user.findUnique({
    where: { id },
    select: { ...userSelect, passwordHash: true },
  });

export const findByRefreshToken = async (refreshToken: string) =>
  prisma.user.findUnique({
    where: { refreshToken },
    select: userSelect,
  });

export const saveRefreshToken = async (id: bigint, refreshToken: string) =>
  prisma.user.update({
    where: { id, isActive: true },
    data: { refreshToken, lastLoginAt: new Date() },
  });

export const rotateRefreshToken = async (id: bigint, currentToken: string, nextToken: string) =>
  prisma.user.update({
    where: { id, isActive: true, refreshToken: currentToken },
    data: { refreshToken: nextToken },
  });

export const removeRefreshToken = async (id: bigint) =>
  prisma.user.update({
    where: { id },
    data: { refreshToken: null },
    select: userSelect,
  });

export const updatePassword = async (id: bigint, passwordHash: string) =>
  prisma.user.update({
    where: { id },
    data: { passwordHash, refreshToken: null },
    select: userSelect,
  });

export const activate = async (id: bigint) =>
  prisma.user.update({
    where: { id },
    data: { isActive: true },
    select: userSelect,
  });

export const deactivate = async (id: bigint) =>
  prisma.user.update({
    where: { id },
    data: { isActive: false, refreshToken: null },
    select: userSelect,
  });