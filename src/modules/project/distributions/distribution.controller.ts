import type { Request, Response } from "express";
import * as distributionService from "./distribution.service.js";
import { serialize } from "../../../common/utils/serializer.js";
import { createDistributionSchema } from "./distribution.schema.js";

type DistributionParams = { id: string };

export const create = async (req: Request, res: Response) => {
  const data = createDistributionSchema.parse(req.body);
  const distribution = await distributionService.create(data, (req as any).user);
  return res.status(201).json({ success: true, data: serialize(distribution) });
};

export const findAll = async (req: Request, res: Response) => {
  const distributions = await distributionService.list((req as any).user);
  return res.status(200).json({ success: true, data: serialize(distributions) });
};

export const findOne = async (req: Request<DistributionParams>, res: Response) => {
  const distribution = await distributionService.getById(req.params.id, (req as any).user);
  return res.status(200).json({ success: true, data: serialize(distribution) });
};