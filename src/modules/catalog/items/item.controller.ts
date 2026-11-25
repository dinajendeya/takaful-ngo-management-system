import type { Request, Response } from "express";
import * as itemService from "./item.service.js";
import { serialize } from "../../../common/utils/serializer.js";
import { createItemSchema, updateItemSchema, listItemsQuerySchema } from "./item.schema.js";

type ItemParams = { id: string };

export const create = async (req: Request, res: Response) => {
  const data = createItemSchema.parse(req.body);
  const item = await itemService.create(data);
  return res.status(201).json({ success: true, data: serialize(item) });
};

export const findAll = async (req: Request, res: Response) => {
  const query = listItemsQuerySchema.parse(req.query);
  const result = await itemService.list(query);
  return res.status(200).json({ success: true, ...serialize(result) });
};

export const findOne = async (req: Request<ItemParams>, res: Response) => {
  const item = await itemService.getById(req.params.id);
  return res.status(200).json({ success: true, data: serialize(item) });
};

export const update = async (req: Request<ItemParams>, res: Response) => {
  const data = updateItemSchema.parse(req.body);
  const item = await itemService.update(req.params.id, data);
  return res.status(200).json({ success: true, data: serialize(item) });
};

export const remove = async (req: Request<ItemParams>, res: Response) => {
  await itemService.softDelete(req.params.id);
  return res.status(204).send();
};

export const restore = async (req: Request<ItemParams>, res: Response) => {
  const item = await itemService.restore(req.params.id);
  return res.status(200).json({ success: true, data: serialize(item) });
};