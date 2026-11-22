import { prisma } from "../../../lib/prisma.js";
import type { CreateBranchDto, UpdateBranchDto } from "../schemas/branch.schema.js";

export const create = async (data: CreateBranchDto) =>
  prisma.branch.create({
    data: {
      name: data.name,
      governorate: data.governorate,
      ...(data.address && { address: data.address }),
      ...(data.phone && { phone: data.phone }),
    },
  });

export const findMany = async () =>
  prisma.branch.findMany({ orderBy: { createdAt: "desc" } });

export const findById = async (id: bigint) =>
  prisma.branch.findUnique({ where: { id } });

export const findByName = async (name: string) =>
  prisma.branch.findUnique({ where: { name } });

export const update = async (id: bigint, data: UpdateBranchDto) =>
  prisma.branch.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.governorate && { governorate: data.governorate }),
      ...(data.address && { address: data.address }),
      ...(data.phone && { phone: data.phone }),
    },
  });

export const activate = async (id: bigint) =>
  prisma.branch.update({
    where: { id },
    data: { isActive: true },
  });

export const deactivate = async (id: bigint) =>
  prisma.branch.update({
    where: { id },
    data: { isActive: false },
  });

