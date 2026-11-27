import type { Request, Response } from "express";
import { FamilyRequestStatus } from "../../../generated/prisma/enums.js";
import { serialize } from "../../../common/utils/serializer.js";
import * as familyRequestService from "./family-request.service.js";

type RequestParams = { id: string };
type RequestQuery = { page?: string; limit?: string; status?: FamilyRequestStatus };
export const create = async (req: Request, res: Response) => {
  return res.status(201).json({ success: true, data: serialize(await familyRequestService.createUpdateRequest(req.body, req.user!)) });
};
export const my = async (req: Request<Record<string, never>, unknown, unknown, RequestQuery>, res: Response) => res.status(200).json({ success: true, data: serialize(await familyRequestService.listMyRequests(req.user!, Number(req.query.page ?? 1), Number(req.query.limit ?? 20))) });
export const pending = async (req: Request<Record<string, never>, unknown, unknown, RequestQuery>, res: Response) => res.status(200).json({ success: true, data: serialize(await familyRequestService.listRequests(req.user!, FamilyRequestStatus.PENDING, Number(req.query.page ?? 1), Number(req.query.limit ?? 20))) });
export const get = async (req: Request<RequestParams>, res: Response) => {
  const request = await familyRequestService.getRequestById(req.params.id, req.user!);
  return res.status(200).json({ success: true, data: serialize(request) });
};
export const cancel = async (req: Request<RequestParams>, res: Response) => {
  return res.status(200).json({ success: true, data: serialize(await familyRequestService.cancelRequest(req.params.id, req.user!, req.body)) });
};
export const approve = async (req: Request<RequestParams>, res: Response) => res.status(200).json({ success: true, data: serialize(await familyRequestService.approveRequest(req.params.id, req.user!.sub)) });
export const reject = async (req: Request<RequestParams>, res: Response) => res.status(200).json({ success: true, data: serialize(await familyRequestService.rejectRequest(req.params.id, req.user!.sub, req.body)) });