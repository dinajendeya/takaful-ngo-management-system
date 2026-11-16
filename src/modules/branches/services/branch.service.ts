import { BranchRepository } from "../repositories/branch.repository.js";
import type { CreateBranchDto, UpdateBranchDto } from "../schemas/branch.schema.js";

export class BranchService {
  constructor(private readonly branchRepository = new BranchRepository()) {}

  async createBranch(data: CreateBranchDto) {
    const existingBranch = await this.branchRepository.findByName(data.name);

    if (existingBranch) {
      throw new Error("Branch with this name already exists");
    }

    return this.branchRepository.create({
      ...data,
      publicId: `BRN-${Date.now()}`,
    });
  }

  async getBranches() {
    return this.branchRepository.findMany();
  }

  async getBranchByPublicId(publicId: string) {
    const branch = await this.branchRepository.findByPublicId(publicId);

    if (!branch) {
      throw new Error("Branch not found");
    }

    return branch;
  }

  async updateBranch(publicId: string, data: UpdateBranchDto) {
    const branch = await this.branchRepository.findByPublicId(publicId);

    if (!branch) {
      throw new Error("Branch not found");
    }

    return this.branchRepository.update(publicId, data);
  }

  async activateBranch(publicId: string) {
    const branch = await this.branchRepository.findByPublicId(publicId);

    if (!branch) {
      throw new Error("Branch not found");
    }

    return this.branchRepository.activate(publicId);
  }

  async deactivateBranch(publicId: string) {
    const branch = await this.branchRepository.findByPublicId(publicId);

    if (!branch) {
      throw new Error("Branch not found");
    }

    return this.branchRepository.deactivate(publicId);
  }
}
