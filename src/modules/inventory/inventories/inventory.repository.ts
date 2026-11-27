import { prisma } from "../../../lib/prisma.js";
import type { CreateInventoryData, UpdateInventoryData } from "./inventory.types.js";

const includeRelations = {
  branch: true,
  inventoryItems: { include: { item: true } },
  inventoryParcels: { include: { parcelTemplate: true } },
};

export const create = async (data: CreateInventoryData) =>
  prisma.inventory.create({
    data: {
      name: data.name,
      branchId: data.branchId,
      createdById: data.createdById,
      ...(data.location !== undefined && { location: data.location }),
    },
    include: includeRelations,
  });

export const findMany = async (branchId?: bigint) =>
  prisma.inventory.findMany({
    where: { 
      isActive: true,
      ...(branchId !== undefined && { branchId }) 
    },
    include: includeRelations,
    orderBy: { createdAt: "desc" },
  });

export const findById = async (id: bigint) =>
  prisma.inventory.findUnique({
    where: { id },
    include: includeRelations,
  });

export const findByNameAndBranch = async (branchId: bigint, name: string) =>
  prisma.inventory.findFirst({
    where: { branchId, name },
  });

export const update = async (id: bigint, data: UpdateInventoryData) =>
  prisma.inventory.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.location !== undefined && { location: data.location }),
    },
    include: includeRelations,
  });

export const deactivate = async (id: bigint) =>
  prisma.inventory.update({
    where: { id },
    data: { isActive: false },
  });

export const getInventoryItems = async (inventoryId: bigint) =>
  prisma.inventoryItem.findMany({
    where: { inventoryId },
    include: { item: true },
  });
  
export const getInventoryParcels = async (inventoryId: bigint) =>
  prisma.inventoryParcel.findMany({
    where: { inventoryId },
    include: { parcelTemplate: true },
  });