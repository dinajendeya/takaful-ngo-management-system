import type { Request, Response } from "express";
import { BranchService } from "../services/branch.service.js";

type BranchParams = { publicId: string };

type BranchParam = {pubilcId: string};

export class BranchControllers{
  constructor(private readonly branchService = new BranchService()){};
  async creat(req:Request<BranchParams>, res: Response){
    const branch = await this.branchService.createBranch(req.body);
    return res.status(201).json({success: true, data: branch});
  }
}
export class BranchController {
  constructor(private readonly branchService = new BranchService()) {}

  async create(req: Request, res: Response) {
    const branch = await this.branchService.createBranch(req.body);
    return res.status(201).json({ success: true, data: branch });
  }

  async findAll(req: Request, res: Response) {
    const branches = await this.branchService.getBranches();
    return res.status(200).json({ success: true, data: branches });
  }

  async findOne(req: Request<BranchParams>, res: Response) {
    const { publicId } = req.params;
    const branch = await this.branchService.getBranchByPublicId(publicId);
    return res.status(200).json({ success: true, data: branch });
  }

  async update(req: Request<BranchParams>, res: Response) {
    const { publicId } = req.params;
    const branch = await this.branchService.updateBranch(
      publicId,
      req.body
    );

    return res.status(200).json({ success: true, data: branch });
  }

  async activate(req: Request<BranchParams>, res: Response) {
    const { publicId } = req.params;
    const branch = await this.branchService.activateBranch(publicId);
    return res.status(200).json({ success: true, data: branch });
  }

  async deactivate(req: Request<BranchParams>, res: Response) {
    const { publicId } = req.params;
    const branch = await this.branchService.deactivateBranch(publicId);
    return res.status(200).json({ success: true, data: branch });
  }

}

export const branchController = new BranchController();