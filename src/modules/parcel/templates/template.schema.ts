import { z } from "zod";
import { ParcelTemplateStatus } from "../../../generated/prisma/enums.js";

const idString = z.string().regex(/^\d+$/, "Invalid id");

const parcelItemSchema = z.object({
  itemId: idString,
  quantity: z.number().positive(),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1).max(150),
  description: z.string().max(5000).optional(),
  items: z.array(parcelItemSchema).min(1, "A template must have at least one item"),
  status: z.enum(ParcelTemplateStatus).optional(),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  description: z.string().max(5000).optional(),
  status: z.enum(ParcelTemplateStatus).optional(),
  items: z.array(parcelItemSchema).min(1).optional(),
});