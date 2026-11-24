import type { z } from "zod";
import type { Item, Prisma } from "../../../generated/prisma/client.js";
import type { createItemSchema, updateItemSchema, listItemsQuerySchema } from "./item.schema.js";

export type CreateItemDto = z.infer<typeof createItemSchema>;
export type UpdateItemDto = z.infer<typeof updateItemSchema>;
export type ListItemsQuery = z.infer<typeof listItemsQuerySchema>;

export type CreateItemData = {
  categoryId: bigint;
  name: string;
  unit: Prisma.ItemCreateInput["unit"];
  description?: string;
};

export type UpdateItemData = {
  categoryId?: bigint;
  name?: string;
  unit?: Prisma.ItemCreateInput["unit"];
  description?: string;
};

export type ItemFilters = {
  categoryId?: bigint;
  search?: string;
  includeDeleted?: boolean;
};

