import { z } from "zod";
import { ProjectStatus } from "../../../generated/prisma/enums.js";

const idString = z.string().regex(/^\d+$/, "Invalid id");

const projectParcelSchema = z.object({
  parcelTemplateId: idString,
  targetQuantity: z.number().int().min(0),
});

export const createProjectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  parcels: z.array(projectParcelSchema).min(1, "A project must have at least one parcel target"),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z.enum(ProjectStatus).optional(),
  parcels: z.array(projectParcelSchema).optional(),
});