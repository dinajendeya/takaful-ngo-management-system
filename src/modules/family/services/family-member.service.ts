import * as familyMemberRepository from "../repositories/family-member.repository.js";
import { parseId } from "../../../common/utils/parseId.js";
import type {
  CreateFamilyMemberDto,
  UpdateFamilyMemberDto,
} from "../schemas/family-member.schema.js";
import * as familyRequestService from "./family-request.service.js";

export const createFamilyMember = async (
  familyId: string,
  createdById: string,
  memberData: CreateFamilyMemberDto,
) =>
  familyRequestService.createUpdateRequest(
    {
      title: "Add family member",
      membersToCreate: [memberData],
      membersToUpdate: [],
      membersToDelete: [],
    },
    familyId,
    createdById,
  );

export const getFamilyMemberById = async (id: string) => {
  const member = await familyMemberRepository.findFamilyMemberById(parseId(id));
  if (!member) throw new Error("Family member not found");
  return member;
};

export const getFamilyMembers = async (familyId: string) =>
  familyMemberRepository.findFamilyMembersByFamilyId(parseId(familyId));

export const updateFamilyMember = async (
  id: string,
  memberData: UpdateFamilyMemberDto,
  requestedById: string,
) => {
  const member = await getFamilyMemberById(id);
  return familyRequestService.createUpdateRequest(
    {
      title: "Update family member",
      membersToCreate: [],
      membersToUpdate: [{ ...memberData, id }],
      membersToDelete: [],
    },
    member.familyId.toString(),
    requestedById,
  );
};

export const deleteFamilyMember = async (id: string, requestedById: string) => {
  const member = await getFamilyMemberById(id);
  return familyRequestService.createUpdateRequest(
    {
      title: "Remove family member",
      membersToCreate: [],
      membersToUpdate: [],
      membersToDelete: [id],
    },
    member.familyId.toString(),
    requestedById,
  );
};
