import type { Request, Response } from "express";
import * as branchService from "../services/branch.service.js";
import { serialize } from "../../../common/utils/serializer.js";

type BranchParams = { id: string };

export const create = async (req: Request, res: Response) => {
  const branch = await branchService.createBranch(req.body);
  return res.status(201).json({ success: true, data: serialize(branch) });
};

export const findAll = async (req: Request, res: Response) => {
  const branches = await branchService.getBranches();
  return res.status(200).json({ success: true, data: serialize(branches) });
};

export const findOne = async (req: Request<BranchParams>, res: Response) => {
  const branch = await branchService.getBranchById(req.params.id);
  return res.status(200).json({ success: true, data: serialize(branch) });
};

export const update = async (req: Request<BranchParams>, res: Response) => {
  const branch = await branchService.updateBranch(req.params.id, req.body);
  return res.status(200).json({ success: true, data: serialize(branch) });
};

export const activate = async (req: Request<BranchParams>, res: Response) => {
  const branch = await branchService.activateBranch(req.params.id);
  return res.status(200).json({ success: true, data: serialize(branch) });
};

export const deactivate = async (req: Request<BranchParams>, res: Response) => {
  const branch = await branchService.deactivateBranch(req.params.id);
  return res.status(200).json({ success: true, data: serialize(branch) });
};