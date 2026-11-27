import { prisma } from "../../../lib/prisma.js";
import type { CreateProjectData, UpdateProjectData } from "./project.types.js";

const includeRelations = {
  createdBy: { select: { id: true, fullName: true } },
  projectParcels: { include: { parcelTemplate: true } },
};

export const create = async (data: CreateProjectData) =>
  prisma.project.create({
    data: {
      name: data.name,
      ...(data.description !== undefined && { description: data.description }),
      startDate: data.startDate,
      ...(data.endDate !== undefined && { endDate: data.endDate }),
      createdById: data.createdById,
      projectParcels: {
        create: data.parcels.map((p) => ({
          parcelTemplateId: p.parcelTemplateId,
          targetQuantity: p.targetQuantity,
          availableQuantity: p.availableQuantity,
        })),
      },
    },
    include: includeRelations,
  });

export const findMany = async () =>
  prisma.project.findMany({
    include: includeRelations,
    orderBy: { createdAt: "desc" },
  });

export const findById = async (id: bigint) =>
  prisma.project.findUnique({
    where: { id },
    include: includeRelations,
  });

export const update = async (id: bigint, data: UpdateProjectData) =>
  prisma.$transaction(async (tx) => {
    // 1. Update basic fields
    await tx.project.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startDate !== undefined && { startDate: data.startDate }),
        ...(data.endDate !== undefined && { endDate: data.endDate }),
        ...(data.status !== undefined && { status: data.status }),
      },
    });

    // 2. Handle Parcel Targets if provided
    if (data.parcels) {
      const existingParcels = await tx.projectParcel.findMany({ where: { projectId: id } });
      const existingMap = new Map(existingParcels.map((p) => [p.parcelTemplateId.toString(), p]));
      
      const incomingIds = new Set(data.parcels.map((p) => p.parcelTemplateId.toString()));

      // Remove parcels that are no longer in the payload
      const toDelete = existingParcels.filter((p) => !incomingIds.has(p.parcelTemplateId.toString()));
      if (toDelete.length > 0) {
        await tx.projectParcel.deleteMany({
          where: { projectId: id, parcelTemplateId: { in: toDelete.map((p) => p.parcelTemplateId) } },
        });
      }

      // Upsert incoming parcels
      for (const parcel of data.parcels) {
        const existing = existingMap.get(parcel.parcelTemplateId.toString());
        
        if (existing) {
          // Calculate difference to adjust availableQuantity safely
          const diff = parcel.targetQuantity - existing.targetQuantity;
          const newAvailable = Math.max(0, existing.availableQuantity + diff);
          
          await tx.projectParcel.update({
            where: { projectId_parcelTemplateId: { projectId: id, parcelTemplateId: parcel.parcelTemplateId } },
            data: { targetQuantity: parcel.targetQuantity, availableQuantity: newAvailable },
          });
        } else {
          // New parcel added to project
          await tx.projectParcel.create({
            data: {
              projectId: id,
              parcelTemplateId: parcel.parcelTemplateId,
              targetQuantity: parcel.targetQuantity,
              availableQuantity: parcel.targetQuantity,
            },
          });
        }
      }
    }

    return tx.project.findUniqueOrThrow({ where: { id }, include: includeRelations });
  });