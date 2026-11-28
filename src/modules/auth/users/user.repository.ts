import { prisma } from "../../../lib/prisma.js";
import type { Prisma } from "../../../generated/prisma/client.js";

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

type CreateUserData = {
  fullName: string;
  email: string;
  passwordHash: string;
  role: Prisma.UserCreateInput["role"];
  branchId?: bigint;
  phone?: string;
};

export const findById = async (id: bigint) =>
  prisma.user.findUnique({ where: { id }, select: userSelect });

export const findByEmail = async (email: string) =>
  prisma.user.findUnique({ where: { email }, select: { id: true } });

export const findMany = async () =>
  prisma.user.findMany({ select: userSelect, orderBy: { createdAt: "desc" } });

export const create = async (data: CreateUserData) =>
  prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
      mustChangePassword: true,
      ...(data.branchId !== undefined && { branchId: data.branchId }),
      ...(data.phone !== undefined && { phone: data.phone }),
    },
    select: userSelect,
  });

export const updateProfile = async (id: bigint, data: Prisma.UserUncheckedUpdateInput) =>
  prisma.user.update({ where: { id }, data, select: userSelect });

export const activate = async (id: bigint) =>
  prisma.user.update({ where: { id }, data: { isActive: true }, select: userSelect });

export const deactivate = async (id: bigint) =>
  prisma.user.update({
    where: { id },
    data: { isActive: false, refreshToken: null },
    select: userSelect,
  });
