import { prisma } from "../../../lib/prisma.js";
import type { CreateUserDto } from "../schemas/auth.schema.js";

export const create = async (data: CreateUserDto & {publicId: string, passwordHash: string}) =>
  prisma.user.create({
    data: {
      publicId: data.publicId,
      fullName: data.fullName,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
      ...(data.branchId && { branchId: data.branchId }),
      ...(data.phone && { phone: data.phone }),
    },
  });

export const findMany = async () => 
  prisma.user.findMany({
    include: { branch: true },
    orderBy: { createdAt: "desc" },
  });

export const findById = async (id: bigint) =>
  prisma.user.findUnique({
    where: { id },
    include: { branch: true },
  });

export const findByPublicId = async (publicId: string) =>
  prisma.user.findUnique({
    where: { publicId },
    include: { branch: true },
  });

export const findByEmail = async (email: string) =>
  prisma.user.findUnique({
    where: { email },
    include: { branch: true },
  });

export const updatePassword = async (publicId: string, passwordHash: string) =>
  prisma.user.update({
    where: { publicId },
    data: { passwordHash },
  });

export const updateLastLogin = async (id: bigint) =>
  prisma.user.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });

export const activate = async (publicId: string) =>
  prisma.user.update({
    where: { publicId },
    data: { isActive: true },
  });

export const deactivate = async (publicId: string) =>
  prisma.user.update({
    where: { publicId },
    data: { isActive: false },
  });