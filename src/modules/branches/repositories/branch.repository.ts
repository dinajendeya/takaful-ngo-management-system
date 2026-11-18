import { prisma } from "../../../lib/prisma.js";
import { GAZA_GOVERNORATES } from "../constants/governorates.js";
import type { CreateBranchDto, UpdateBranchDto } from "../schemas/branch.schema.js";

export class BranchRepository {
  async create(data: CreateBranchDto & { publicId: string }) {
    return prisma.branch.create({
      data: {
        publicId: data.publicId,
        name: data.name,
        governorate: data.governorate,
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
      },
    });
  }

  async findMany() {
    return prisma.branch.findMany({ orderBy: { createdAt: "desc" } });
  }

  async findById(id: bigint) {
    return prisma.branch.findUnique({ where: { id } });
  }

  async findByPublicId(publicId: string) {
    return prisma.branch.findUnique({ where: { publicId } });
  }

  async findByName(name: string) {
    return prisma.branch.findUnique({ where: { name } });
  }

  async update(publicId: string, data: UpdateBranchDto) {
    return prisma.branch.update({
      where: { publicId },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.governorate !== undefined ? { governorate: data.governorate } : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.phone !== undefined ? { phone: data.phone } : {}),
      },
    });
  }

  async activate(publicId: string) {
    return prisma.branch.update({ where: { publicId }, data: { isActive: true } });
  }

  async deactivate(publicId: string) {
    return prisma.branch.update({ where: { publicId }, data: { isActive: false } });
  }
}
