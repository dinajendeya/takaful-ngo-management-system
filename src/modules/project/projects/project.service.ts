import { parseId } from "../../../common/utils/parseId.js";
import * as projectRepository from "./project.repository.js";
import * as templateRepository from "../../parcel/templates/template.repository.js";
import type { CreateProjectDto, UpdateProjectDto } from "./project.types.js";

const validateParcels = async (parcels: { parcelTemplateId: string }[]) => {
  for (const p of parcels) {
    if (!(await templateRepository.findById(parseId(p.parcelTemplateId)))) {
      throw new Error(`Parcel Template with ID ${p.parcelTemplateId} not found`);
    }
  }
};

export const create = async (data: CreateProjectDto, createdById: string) => {
  await validateParcels(data.parcels);

  return projectRepository.create({
    name: data.name,
    ...(data.description !== undefined && { description: data.description }),
    startDate: data.startDate,
    ...(data.endDate !== undefined && { endDate: data.endDate }),
    createdById: parseId(createdById),
    parcels: data.parcels.map((p) => ({
      parcelTemplateId: parseId(p.parcelTemplateId),
      targetQuantity: p.targetQuantity,
      availableQuantity: p.targetQuantity, // On create, available = target
    })),
  });
};

export const list = async () => {
  return projectRepository.findMany();
};

export const getById = async (id: string) => {
  const project = await projectRepository.findById(parseId(id));
  if (!project) throw new Error("Project not found");
  return project;
};

export const update = async (id: string, data: UpdateProjectDto) => {
  const projectId = parseId(id);
  if (!(await projectRepository.findById(projectId))) {
    throw new Error("Project not found");
  }

  if (data.parcels) {
    await validateParcels(data.parcels);
  }

  return projectRepository.update(projectId, {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.startDate !== undefined && { startDate: data.startDate }),
    ...(data.endDate !== undefined && { endDate: data.endDate }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.parcels && {
      parcels: data.parcels.map((p) => ({
        parcelTemplateId: parseId(p.parcelTemplateId),
        targetQuantity: p.targetQuantity,
        availableQuantity: 0, // The repo handles the math
      })),
    }),
  });
};