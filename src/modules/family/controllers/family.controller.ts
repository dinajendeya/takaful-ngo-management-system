import type { Request, Response } from "express";
import { FamilyStatus } from "../../../generated/prisma/enums.js";
import { serialize } from "../../../common/utils/serializer.js";
import * as familyService from "../services/family.service.js";

type FamilyParams = { id: string };
type FamilyQuery = { page?: string; limit?: string; status?: FamilyStatus; branchId?: string; primaryPhone?: string };

export const create = async (req: Request, res: Response) => res.status(201).json({ success: true, data: serialize(await familyService.createFamily(req.body, req.user!)) });
export const list = async (req: Request<Record<string, never>, unknown, unknown, FamilyQuery>, res: Response) => {
  const { page, limit, ...filters } = req.query;
  return res.status(200).json({ success: true, data: serialize(await familyService.getFamilies(filters, Number(page ?? 1), Number(limit ?? 20), req.user!)) });
};
export const get = async (req: Request<FamilyParams>, res: Response) => res.status(200).json({ success: true, data: serialize(await familyService.getFamilyById(req.params.id, req.user!)) });
export const update = async (req: Request<FamilyParams>, res: Response) => res.status(200).json({ success: true, data: serialize(await familyService.updateFamily(req.params.id, req.body, req.user!)) });
export const verify = async (req: Request<FamilyParams>, res: Response) => res.status(200).json({ success: true, data: serialize(await familyService.verifyFamily(req.params.id, req.user!.sub, req.user!)) });
export const reject = async (req: Request<FamilyParams>, res: Response) => res.status(200).json({ success: true, data: serialize(await familyService.rejectFamily(req.params.id, req.user!.sub, req.user!)) });
export const remove = async (req: Request<FamilyParams>, res: Response) => res.status(200).json({ success: true, data: serialize(await familyService.softDeleteFamily(req.params.id, req.user!)) });