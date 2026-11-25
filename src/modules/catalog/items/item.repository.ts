import { prisma } from "../../../lib/prisma.js";
import type { CreateItemData, UpdateItemData, ItemFilters} from "./item.types.js";


export const create = async (data: CreateItemData) =>
  prisma.item.create({
    data: {
      categoryId: data.categoryId,
      name: data.name,
      unit: data.unit,
      ...(data.description !== undefined && { description: data.description }),
    },
  });

export const findMany = async (filters: ItemFilters = {}, page = 1, limit = 20) =>
  prisma.item.findMany({
    where: {
      ...(filters.categoryId !== undefined && { categoryId: filters.categoryId }),
      ...(filters.search !== undefined && { name: { contains: filters.search, mode: "insensitive" } }),
      ...(filters.includeDeleted ? {} : { deletedAt: null }),
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { name: "desc" },
  });

export const count = async (filters: ItemFilters = {}) =>
  prisma.item.count({
    where: {
      ...(filters.categoryId !== undefined && { categoryId: filters.categoryId }),
      ...(filters.search !== undefined && { name: { contains: filters.search, mode: "insensitive" } }),
      ...(filters.includeDeleted ? {} : { deletedAt: null }),
    },
  });

export const findById = async (id: bigint) =>
  prisma.item.findUnique({ where: { id } });

export const findByIds = async (ids: bigint[]) =>
  prisma.item.findMany({ where: { id: { in: ids } } });

export const findByNameAndCategory = async (categoryId: bigint, name: string) =>
  prisma.item.findFirst({
    where: { categoryId, name: { equals: name, mode: "insensitive" }, deletedAt: null },
  });

export const findByCategoryId = async (categoryId: bigint) =>
  prisma.item.findMany({
    where: { categoryId, deletedAt: null },
    orderBy: { name: "asc" },
  });

export const exists = async (id: bigint) =>
  (await prisma.item.findUnique({ where: { id }, select: { id: true } })) !== null;

export const update = async (id: bigint, data: UpdateItemData) =>
  prisma.item.update({
    where: { id },
    data: {
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.unit !== undefined && { unit: data.unit }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });

export const softDelete = async (id: bigint) =>
  prisma.item.update({ where: { id }, data: { deletedAt: new Date() } });

export const restore = async (id: bigint) =>
  prisma.item.update({ where: { id }, data: { deletedAt: null } });