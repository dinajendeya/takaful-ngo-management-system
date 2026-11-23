import * as familyRepository from "../repositories/family.repository.js";
import { parseId } from "../../../common/utils/parseId.js";
import { FamilyStatus } from "../../../generated/prisma/enums.js";
import * as familyRequestService from "./family-request.service.js";
import type {
  CreatingFamilyRequestDto,
  UpdatingFamilyRequestDto,
} from "../schemas/family-request.schema.js";

export const createFamily = async (
  data: CreatingFamilyRequestDto,
  requestedById: string,
) => {
  return familyRequestService.createRegistrationRequest(data, requestedById);
};

export const getFamilyById = async (id: string) => {
  const family = await familyRepository.findFamilyById(parseId(id));
  if (!family) throw new Error("Family not found");
  return family;
};

export const getFamilies = async (
  filters: { status?: FamilyStatus; branchId?: string; primaryPhone?: string } = {},
  page = 1,
  limit = 20,
) =>
  familyRepository.findManyFamilies(
    {
      ...(filters.status && { status: filters.status }),
      ...(filters.branchId && { branchId: parseId(filters.branchId) }),
      ...(filters.primaryPhone && { primaryPhone: filters.primaryPhone }),
    },
    page,
    limit,
  );

export const updateFamily = async (
  familyId: string,
  data: UpdatingFamilyRequestDto,
  requestedById: string,
) => familyRequestService.createUpdateRequest(data, familyId, requestedById);

export const verifyFamily = async (familyId: string, verifiedById: string) => {
  const family = await familyRepository.findFamilyById(parseId(familyId));
  if (!family) throw new Error("Family not found");
  if (family.status === FamilyStatus.VERIFIED) throw new Error("Family is already verified");
  if (family.status === FamilyStatus.REJECTED) throw new Error("Rejected family cannot be verified");

  return familyRepository.verifyFamily(parseId(familyId), parseId(verifiedById));
};

export const rejectFamily = async (familyId: string, verifiedById: string) => {
  const family = await familyRepository.findFamilyById(parseId(familyId));
  if (!family) throw new Error("Family not found");
  if (family.status === FamilyStatus.VERIFIED) throw new Error("Verified family cannot be rejected");

  return familyRepository.rejectFamily(parseId(familyId), parseId(verifiedById));
};
