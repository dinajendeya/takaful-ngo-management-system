import { prisma } from "../../../lib/prisma.js";
import type { CreateBranchDto, UpdateBranchDto } from "../schemas/branch.schema.js";

export const create = async (data: CreateBranchDto & { publicId: string }) =>
  prisma.branch.create({
    data: {
      publicId: data.publicId,
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

export const findByPublicId = async (publicId: string) =>
  prisma.branch.findUnique({ where: { publicId } });

export const findByName = async (name: string) =>
  prisma.branch.findUnique({ where: { name } });

export const update = async (publicId: string, data: UpdateBranchDto) =>
  prisma.branch.update({
    where: { publicId },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.governorate && { governorate: data.governorate }),
      ...(data.address && { address: data.address }),
      ...(data.phone && { phone: data.phone }),
    },
  });

export const activate = async (publicId: string) =>
  prisma.branch.update({
    where: { publicId },
    data: { isActive: true },
  });

export const deactivate = async (publicId: string) =>
  prisma.branch.update({
    where: { publicId },
    data: { isActive: false },
  });

