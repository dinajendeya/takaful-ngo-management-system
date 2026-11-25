import * as branchRepository from "../repositories/branch.repository.js";
import { parseId } from "../../../common/utils/parseId.js";
import type { CreateBranchDto, UpdateBranchDto } from "../schemas/branch.schema.js";

export const createBranch = async (data: CreateBranchDto) => {
  const existingBranch = await branchRepository.findByName(data.name);
  if (existingBranch) throw new Error("Branch with this name already exists");
  
  return branchRepository.create({...data,});
};

export const getBranches = async () => {
  return branchRepository.findMany();
};

export const getBranchById = async (id: string) => {
  const branch = await branchRepository.findById(parseId(id));
  if (!branch) throw new Error("Branch not found");

  return branch;
};

export const updateBranch = async (
  id: string,
  data: UpdateBranchDto
) => {
  const branchId = parseId(id);
  const branch = await branchRepository.findById(branchId);

  if (!branch) throw new Error("Branch not found");

  return branchRepository.update(branchId, data);
};

export const activateBranch = async (id: string) => {
  const branchId = parseId(id);
  const branch = await branchRepository.findById(branchId);

  if (!branch) {
    throw new Error("Branch not found");
  }

  return branchRepository.activate(branchId);
};

export const deactivateBranch = async (id: string) => {
  const branchId = parseId(id);
  const branch = await branchRepository.findById(branchId);

  if (!branch) {
    throw new Error("Branch not found");
  }

  return branchRepository.deactivate(branchId);
};
