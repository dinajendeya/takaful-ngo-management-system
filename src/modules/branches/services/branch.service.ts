import * as branchRepository from "../repositories/branch.repository.js";
import type { CreateBranchDto, UpdateBranchDto } from "../schemas/branch.schema.js";

export const createBranch = async (data: CreateBranchDto) => {
  const existingBranch = await branchRepository.findByName(data.name);

  if (existingBranch) {
    throw new Error("Branch with this name already exists");
  }

  return branchRepository.create({
    ...data,
    publicId: `BRN-${Date.now()}`,
  });
};

export const getBranches = async () => {
  return branchRepository.findMany();
};

export const getBranchByPublicId = async (publicId: string) => {
  const branch = await branchRepository.findByPublicId(publicId);

  if (!branch) {
    throw new Error("Branch not found");
  }

  return branch;
};

export const updateBranch = async (
  publicId: string,
  data: UpdateBranchDto
) => {
  const branch = await branchRepository.findByPublicId(publicId);

  if (!branch) {
    throw new Error("Branch not found");
  }

  return branchRepository.update(publicId, data);
};

export const activateBranch = async (publicId: string) => {
  const branch = await branchRepository.findByPublicId(publicId);

  if (!branch) {
    throw new Error("Branch not found");
  }

  return branchRepository.activate(publicId);
};

export const deactivateBranch = async (publicId: string) => {
  const branch = await branchRepository.findByPublicId(publicId);

  if (!branch) {
    throw new Error("Branch not found");
  }

  return branchRepository.deactivate(publicId);
};
