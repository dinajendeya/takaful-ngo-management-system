import { parseId } from "../../../common/utils/parseId.js";
import * as donorRepository from "./donor.repository.js";
import { prisma } from "../../../lib/prisma.js";
export const getMyProfile = async (id: string) => {
  const donor = await donorRepository.findById(parseId(id));
  if (!donor) throw new Error("Donor not found");
  return donor;
};

export const updateMyProfile = async (
  id: string,
  data: { name?: string; contactPerson?: string; phone?: string }
) => {
  return donorRepository.update(parseId(id), data);
};

export const listAllDonors = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  const [donors, total] = await Promise.all(([donorRepository.findMany(skip, limit), prisma.donor.count()]));
  return { data: donors, meta: { page, limit, total } };
};

export const getDonorById = async (id: string) => {
  const donor = await donorRepository.findById(parseId(id));
  if (!donor) throw new Error("Donor not found");
  return donor;
};

export const adminUpdateDonor = async (
  id: string,
  data: { name?: string; contactPerson?: string; phone?: string; donorType?: any; notes?: string }
) => {
  return donorRepository.update(parseId(id), data);
};
