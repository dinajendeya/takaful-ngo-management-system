import { prisma } from "../../../lib/prisma.js";

export const findByEmail = async (email: string) =>
  prisma.donor.findUnique({ where: { email } });

export const findByRefreshToken = async (refreshToken: string) =>
  prisma.donor.findFirst({ where: { refreshToken } });

export const findById = async (id: bigint) =>
  prisma.donor.findUnique({ where: { id } });

export const create = async (data: {
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  donorType: string;
  passwordHash: string;
}) =>
  prisma.donor.create({
    data: {
      ...data,
      donorType: data.donorType as any, // Prisma enum typing
    },
  });

export const updateAuth = async (
  id: bigint,
  data: { refreshToken?: string | null; passwordHash?: string }
) =>
  prisma.donor.update({
    where: { id },
    data,
  });

export const rotateRefreshToken = async (
  id: bigint,
  currentHash: string,
  newHash: string
) =>
  prisma.donor.updateMany({
    where: { id, refreshToken: currentHash },
    data: { refreshToken: newHash },
  });