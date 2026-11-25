import type { Request, Response } from "express";
import { serialize } from "../../../common/utils/serializer.js";
import * as assessmentService from "../services/family-assessment.service.js";

type FamilyParams = { familyId: string };
export const create = async (req: Request<FamilyParams>, res: Response) => res.status(201).json({ success: true, data: serialize(await assessmentService.createAssessment(req.params.familyId, req.body, req.user!)) });
export const get = async (req: Request<FamilyParams>, res: Response) => res.status(200).json({ success: true, data: serialize(await assessmentService.getAssessment(req.params.familyId, req.user!)) });
export const update = async (req: Request<FamilyParams>, res: Response) => res.status(200).json({ success: true, data: serialize(await assessmentService.updateAssessment(req.params.familyId, req.body, req.user!)) });
