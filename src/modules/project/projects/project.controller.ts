import type { Request, Response } from "express";
import * as projectService from "./project.service.js";
import { serialize } from "../../../common/utils/serializer.js";
import { createProjectSchema, updateProjectSchema } from "./project.schema.js";

type ProjectParams = { id: string };

export const create = async (req: Request, res: Response) => {
  const data = createProjectSchema.parse(req.body);
  const userId = (req as any).user.id;
  const project = await projectService.create(data, userId);
  return res.status(201).json({ success: true, data: serialize(project) });
};

export const findAll = async (req: Request, res: Response) => {
  const projects = await projectService.list();
  return res.status(200).json({ success: true, data: serialize(projects) });
};

export const findOne = async (req: Request<ProjectParams>, res: Response) => {
  const project = await projectService.getById(req.params.id);
  return res.status(200).json({ success: true, data: serialize(project) });
};

export const update = async (req: Request<ProjectParams>, res: Response) => {
  const data = updateProjectSchema.parse(req.body);
  const project = await projectService.update(req.params.id, data);
  return res.status(200).json({ success: true, data: serialize(project) });
};