import type { Request, Response } from "express";
import * as inventoryService from "./inventory.service.js";
import { serialize } from "../../../common/utils/serializer.js";
import { createInventorySchema, updateInventorySchema } from "./inventory.schema.js";

type InventoryParams = { id: string };

export const create = async (req: Request, res: Response) => {
  const data = createInventorySchema.parse(req.body);
  const inventory = await inventoryService.create(data, (req as any).user);
  return res.status(201).json({ success: true, data: serialize(inventory) });
};

export const findAll = async (req: Request, res: Response) => {
  const inventories = await inventoryService.list(req.user!);
  return res.status(200).json({ success: true, data: serialize(inventories) });
};

export const findOne = async (req: Request<InventoryParams>, res: Response) => {
  const inventory = await inventoryService.getById(req.params.id, (req as any).user);
  return res.status(200).json({ success: true, data: serialize(inventory) });
};

export const findStock = async (req: Request<InventoryParams>, res: Response) => {
  const stock = await inventoryService.getStock(req.params.id, (req as any).user);
  return res.status(200).json({ success: true, data: serialize(stock) });
};

export const update = async (req: Request<InventoryParams>, res: Response) => {
  const data = updateInventorySchema.parse(req.body);
  const inventory = await inventoryService.update(req.params.id, data, (req as any).user);
  return res.status(200).json({ success: true, data: serialize(inventory) });
};

export const deactivate = async (req: Request<InventoryParams>, res: Response) => {
  await inventoryService.deactivate(req.params.id, (req as any).user);
  return res.status(204).send();
};