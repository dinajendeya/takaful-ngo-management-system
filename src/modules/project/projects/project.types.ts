import type { z } from "zod";
import type { createProjectSchema, updateProjectSchema } from "./project.schema.js";
import type { ProjectStatus } from "../../../generated/prisma/enums.js";

export type CreateProjectDto = z.infer<typeof createProjectSchema>;
export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;

export type CreateProjectData = {
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  createdById: bigint;
  parcels: { parcelTemplateId: bigint; targetQuantity: number; availableQuantity: number }[];
};

export type UpdateProjectData = {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ProjectStatus;
  parcels?: { parcelTemplateId: bigint; targetQuantity: number; availableQuantity: number }[];
};