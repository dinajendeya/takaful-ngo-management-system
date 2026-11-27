import type { Request, Response } from "express";
import * as donorService from "./donor.service.js";
import { serialize } from "../../../common/utils/serializer.js";
import { updateDonorProfileSchema, adminUpdateDonorSchema } from "./donor.schema.js";

type DonorParams = { id: string };

// Donor Portal Routes 
export const getMyProfile = async (req: Request, res: Response) => {
  const donor = await donorService.getMyProfile((req as any).user.sub);
  return res.status(200).json({ success: true, data: serialize(donor) });
};

export const updateMyProfile = async (req: Request, res: Response) => {
  const data = updateDonorProfileSchema.parse(req.body);
  const donor = await donorService.updateMyProfile((req as any).user.sub, data);
  return res.status(200).json({ success: true, data: serialize(donor) });
};

// Admin and Financial Manager Routes 
export const listAllDonors = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const result = await donorService.listAllDonors(page, limit);
  return res.status(200).json({ success: true, ...serialize(result) });
};

export const getDonorById = async (req: Request<DonorParams>, res: Response) => {
  const donor = await donorService.getDonorById(req.params.id);
  return res.status(200).json({ success: true, data: serialize(donor) });
};

export const adminUpdateDonor = async (req: Request<DonorParams>, res: Response) => {
  const data = adminUpdateDonorSchema.parse(req.body);
  const donor = await donorService.adminUpdateDonor(req.params.id, data);
  return res.status(200).json({ success: true, data: serialize(donor) });
};