import type { Request, Response } from "express";
import { serialize } from "../../../common/utils/serializer.js";
import * as familyMemberService from "../services/family-member.service.js";

type MemberParams = { familyId: string; memberId: string };
type MemberQuery = { page?: string; limit?: string };
export const create = async (req: Request<{ familyId: string }>, res: Response) => res.status(201).json({ success: true, data: serialize(await familyMemberService.createFamilyMember(req.params.familyId, req.user!, req.body)) });
export const list = async (req: Request<{ familyId: string }, unknown, unknown, MemberQuery>, res: Response) => res.status(200).json({ success: true, data: serialize(await familyMemberService.getFamilyMembers(req.params.familyId, req.user!, Number(req.query.page ?? 1), Number(req.query.limit ?? 20))) });
export const get = async (req: Request<MemberParams>, res: Response) => res.status(200).json({ success: true, data: serialize(await familyMemberService.getFamilyMember(req.params.familyId, req.params.memberId, req.user!)) });
export const update = async (req: Request<MemberParams>, res: Response) => res.status(200).json({ success: true, data: serialize(await familyMemberService.updateFamilyMemberDirect(req.params.familyId, req.params.memberId, req.body, req.user!)) });
export const remove = async (req: Request<MemberParams>, res: Response) => res.status(200).json({ success: true, data: serialize(await familyMemberService.deleteFamilyMemberDirect(req.params.familyId, req.params.memberId, req.user!)) });