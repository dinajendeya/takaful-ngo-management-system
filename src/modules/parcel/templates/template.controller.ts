import type { Request, Response } from "express";
import * as templateService from "./template.service.js";
import { serialize } from "../../../common/utils/serializer.js";
import { createTemplateSchema, updateTemplateSchema } from "./template.schema.js";

type TemplateParams = { id: string };

export const create = async (req: Request, res: Response) => {
  const data = createTemplateSchema.parse(req.body);
  const userId = (req as any).user.id; 
  const template = await templateService.create(data, userId);
  return res.status(201).json({ success: true, data: serialize(template) });
};

export const findAll = async (req: Request, res: Response) => {
  const templates = await templateService.list();
  return res.status(200).json({ success: true, data: serialize(templates) });
};

export const findOne = async (req: Request<TemplateParams>, res: Response) => {
  const template = await templateService.getById(req.params.id);
  return res.status(200).json({ success: true, data: serialize(template) });
};

export const update = async (req: Request<TemplateParams>, res: Response) => {
  const data = updateTemplateSchema.parse(req.body);
  const template = await templateService.update(req.params.id, data);
  return res.status(200).json({ success: true, data: serialize(template) });
};

export const archive = async (req: Request<TemplateParams>, res: Response) => {
  await templateService.archive(req.params.id);
  return res.status(204).send();
};