import type { z } from "zod";
import type { createTemplateSchema, updateTemplateSchema } from "./template.schema.js";
import type { ParcelTemplateStatus } from "../../../generated/prisma/enums.js";

export type CreateTemplateDto = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateDto = z.infer<typeof updateTemplateSchema>;

export type CreateTemplateData = {
  name: string;
  description?: string;
  status?: ParcelTemplateStatus;
  createdById: bigint;
  items: { itemId: bigint; quantity: number }[];
};

export type UpdateTemplateData = {
  name?: string;
  description?: string;
  status?: ParcelTemplateStatus;
  items?: { itemId: bigint; quantity: number }[];
};