import { prisma } from "../../../lib/prisma.js";
import type { CreateTemplateData, UpdateTemplateData } from "./template.types.js";

const includeItems = { parcelItems: { include: { item: true } } };

export const create = async (data: CreateTemplateData) =>
  prisma.parcelTemplate.create({
    data: {
      name: data.name,
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      createdById: data.createdById,
      parcelItems: {
        create: data.items.map((i) => ({
          itemId: i.itemId,
          quantity: i.quantity,
        })),
      },
    },
    include: includeItems,
  });

export const findMany = async () =>
  prisma.parcelTemplate.findMany({
    include: includeItems,
    orderBy: { createdAt: "desc" },
  });

export const findById = async (id: bigint) =>
  prisma.parcelTemplate.findUnique({
    where: { id },
    include: includeItems,
  });

export const findByName = async (name: string) =>
  prisma.parcelTemplate.findFirst({ where: { name } });

export const update = async (id: bigint, data: UpdateTemplateData) =>
  prisma.$transaction(async (tx) => {
    // 1. Update basic fields
    await tx.parcelTemplate.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });

    // 2. If items are provided, replace them (Delete old, create new)
    if (data.items) {
      await tx.parcelItem.deleteMany({ where: { parcelTemplateId: id } });
      await tx.parcelItem.createMany({
        data: data.items.map((item) => ({
          parcelTemplateId: id,
          itemId: item.itemId,
          quantity: item.quantity,
        })),
      });
    }

    // 3. Return the updated template
    return tx.parcelTemplate.findUniqueOrThrow({
      where: { id },
      include: includeItems,
    });
  });

export const archive = async (id: bigint) =>
  prisma.parcelTemplate.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });