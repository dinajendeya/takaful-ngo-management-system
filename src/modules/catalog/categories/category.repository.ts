import { prisma } from "../../../lib/prisma.js";
import type { Prisma } from "../../../generated/prisma/client.js";
import type { CreateCategoryDto, UpdateCategoryDto } from "./category.types.js";

export const create = async (data: CreateCategoryDto) =>
  prisma.category.create({
    data: {
      name: data.name,
      ...(data.description !== undefined && { description: data.description }),
    },
  });

export const findMany = async () =>
  prisma.category.findMany({ 
    where: { deletedAt: null },
    orderBy: { name: "asc" } 
  });

export const findById = async (id: bigint) =>
  prisma.category.findUnique({ where: { id } });

export const findByName = async (name: Prisma.CategoryCreateInput["name"]) =>
  prisma.category.findFirst({ 
    where: { name, deletedAt: null } 
  });

export const update = async (id: bigint, data: UpdateCategoryDto) =>
  prisma.category.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });

export const softDelete = async (id: bigint) =>
  prisma.category.update({ 
    where: { id }, 
    data: { deletedAt: new Date() } 
  });

export const countItemsInCategory = async (categoryId: bigint) =>
  prisma.item.count({ 
    where: { categoryId, deletedAt: null } 
  });