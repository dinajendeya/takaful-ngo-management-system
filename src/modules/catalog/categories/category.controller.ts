import type { Request, Response } from "express";
import * as categoryService from "./category.service.js";
import { serialize } from "../../../common/utils/serializer.js";

type CategoryParams = { id: string };

export const create = async (req: Request, res: Response) => {
  const category = await categoryService.create(req.body);
  return res.status(201).json({ success: true, data: serialize(category) });
};

export const findAll = async (req: Request, res: Response) => {
  const categories = await categoryService.list();
  return res.status(200).json({ success: true, data: serialize(categories) });
};

export const findOne = async (req: Request<CategoryParams>, res: Response) => {
  const category = await categoryService.getById(req.params.id);
  return res.status(200).json({ success: true, data: serialize(category) });
};

export const update = async (req: Request<CategoryParams>, res: Response) => {
  const category = await categoryService.update(req.params.id, req.body);
  return res.status(200).json({ success: true, data: serialize(category) });
};

export const remove = async (req: Request<CategoryParams>, res: Response) => {
  await categoryService.softDelete(req.params.id);
  return res.status(204).send();
};