import { parseId } from "../../../common/utils/parseId.js";
import * as inventoryRepository from "./inventory.repository.js";
import * as branchRepository from "../../branches/repositories/branch.repository.js";
import type { CreateInventoryDto, UpdateInventoryDto } from "./inventory.types.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import type { AuthUser } from "../../../common/types/auth-user.js";

export const create = async (data: CreateInventoryDto, requestUser: AuthUser) => {
  const branchId = parseId(data.branchId);
  
  // 🔒 SECURITY: Branch managers can only create inventories in THEIR branch
  if (requestUser.role === UserRole.BRANCH_MANAGER && requestUser.branchId !== data.branchId) {
    throw new Error("You can only create inventories for your own branch");
  }

  if (!(await branchRepository.findById(branchId))) {
    throw new Error("Branch not found");
  }

  if (await inventoryRepository.findByNameAndBranch(branchId, data.name)) {
    throw new Error("An inventory with this name already exists in this branch");
  }

  return inventoryRepository.create({
    name: data.name,
    branchId,
    createdById: parseId(requestUser.sub),
    ...(data.location !== undefined && { location: data.location }),
  });
};

export const list = async (requestUser: AuthUser) => {
  // 🔒 SECURITY: If Branch Manager, force filter to their branch. Admin sees all.
  const branchFilter = requestUser.role === UserRole.BRANCH_MANAGER && requestUser.branchId 
    ? parseId(requestUser.branchId) 
    : undefined;

  return inventoryRepository.findMany(branchFilter);
};

export const getById = async (id: string, requestUser: AuthUser) => {
  const inventory = await inventoryRepository.findById(parseId(id));
  if (!inventory) throw new Error("Inventory not found");

  // 🔒 SECURITY: Ensure Branch Manager can't view another branch's inventory by guessing the ID
  if (requestUser.role === UserRole.BRANCH_MANAGER && inventory.branchId.toString() !== requestUser.branchId) {
    throw new Error("Unauthorized to access this inventory");
  }

  return inventory;
};

export const getStock = async (id: string, requestUser: AuthUser) => {
  const inventoryId = parseId(id);
  const inventory = await inventoryRepository.findById(inventoryId);
  
  if (!inventory) throw new Error("Inventory not found");
  
  if (requestUser.role === UserRole.BRANCH_MANAGER && inventory.branchId.toString() !== requestUser.branchId) {
    throw new Error("Unauthorized to access this inventory");
  }
  
  const [items, parcels] = await Promise.all([
    inventoryRepository.getInventoryItems(inventoryId),
    inventoryRepository.getInventoryParcels(inventoryId)
  ]);

  return { items, parcels };
};

export const update = async (id: string, data: UpdateInventoryDto, requestUser: AuthUser) => {
  const inventoryId = parseId(id);
  const existing = await inventoryRepository.findById(inventoryId);
  if (!existing) throw new Error("Inventory not found");

  if (requestUser.role === UserRole.BRANCH_MANAGER && existing.branchId.toString() !== requestUser.branchId) {
    throw new Error("Unauthorized to update this inventory");
  }

  if (data.name !== undefined) {
    const duplicate = await inventoryRepository.findByNameAndBranch(existing.branchId, data.name);
    if (duplicate && duplicate.id !== inventoryId) {
      throw new Error("An inventory with this name already exists in this branch");
    }
  }

  return inventoryRepository.update(inventoryId, data);
};

export const deactivate = async (id: string, requestUser: AuthUser) => {
  const inventoryId = parseId(id);
  const existing = await inventoryRepository.findById(inventoryId);
  if (!existing) throw new Error("Inventory not found");

  if (requestUser.role === UserRole.BRANCH_MANAGER && existing.branchId.toString() !== requestUser.branchId) {
    throw new Error("Unauthorized to delete this inventory");
  }

  await inventoryRepository.deactivate(inventoryId);
};