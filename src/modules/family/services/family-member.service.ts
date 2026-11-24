import * as familyMemberRepository from "../repositories/family-member.repository.js";
import * as familyRepository from "../repositories/family.repository.js";
import { parseId } from "../../../common/utils/parseId.js";
import { Relationship } from "../../../generated/prisma/enums.js";
import type {
  CreateFamilyMemberDto,
  UpdateFamilyMemberDto,
} from "../schemas/family-member.schema.js";
import { createFamilyMemberSchema } from "../schemas/family-member.schema.js";

export const ensureNationalIdAvailable = async (
  nationalId: string,
  options: { ignoreMemberId?: bigint; allowFamilyId?: bigint; deletingIds?: Set<string> } = {},
) => {
  const existing = await familyMemberRepository.findFamilyMemberByNationalId(nationalId);
  if (!existing) return;

  // Same member updating itself → fine
  if (options.ignoreMemberId !== undefined && existing.id === options.ignoreMemberId) return;

  // Member being deleted in the same transaction → fine
  if (
    options.allowFamilyId !== undefined &&
    existing.familyId === options.allowFamilyId &&
    options.deletingIds?.has(existing.id.toString())
  ) {
    return;
  }

  throw new Error("National ID already exists");
};

export const ensureMembersBelongToFamily = (
  familyMemberIds: Set<string>,
  requestedIds: bigint[],
) => {
  if (requestedIds.some((memberId) => !familyMemberIds.has(memberId.toString()))) {
    throw new Error("Requested member change does not belong to this family");
  }
};

export const ensureNoDuplicateMemberOperations = (
  updateIds: bigint[],
  deleteIds: bigint[],
) => {
  const updateSet = new Set(updateIds.map(String));
  const deleteSet = new Set(deleteIds.map(String));
  if (
    updateSet.size !== updateIds.length ||
    deleteSet.size !== deleteIds.length ||
    [...updateSet].some((id) => deleteSet.has(id))
  ) {
    throw new Error("A family member can only be changed once per request");
  }
};

export const ensureSingleFamilyHead = (relationships: Relationship[]) => {
  if (relationships.filter((r) => r === Relationship.HEAD).length !== 1) {
    throw new Error("A family must have exactly one head after the requested changes");
  }
};

export const validateNationalIds = (nationalIds: string[]) => {
  if (new Set(nationalIds).size !== nationalIds.length) {
    throw new Error("National IDs must be unique");
  }
};

/* The aggregator used by request service                             */

export type MemberChangesInput = {
  familyId: bigint;
  existingMembers: { id: bigint; nationalId: string; relationship: Relationship }[];
  membersToCreate: CreateFamilyMemberDto[];
  membersToUpdate: (UpdateFamilyMemberDto & { id: string })[];
  membersToDelete: string[];
};

export const validateMemberChanges = async (input: MemberChangesInput) => {
  const updateIds = input.membersToUpdate.map((m) => parseId(m.id));
  const deleteIds = input.membersToDelete.map(parseId);
  const familyMemberIds = new Set(input.existingMembers.map((m) => m.id.toString()));
  const deleting = new Set(deleteIds.map(String));

  ensureMembersBelongToFamily(familyMemberIds, [...updateIds, ...deleteIds]);
  ensureNoDuplicateMemberOperations(updateIds, deleteIds);

  // Resulting relationships
  const updates = new Map(input.membersToUpdate.map((m) => [m.id, m]));
  const resultingRelationships = input.existingMembers
    .filter((m) => !deleting.has(m.id.toString()))
    .map((m) => updates.get(m.id.toString())?.relationship ?? m.relationship)
    .concat(input.membersToCreate.map((m) => m.relationship));
  ensureSingleFamilyHead(resultingRelationships);

  // Resulting national IDs
  const resultingNationalIds = input.existingMembers
    .filter((m) => !deleting.has(m.id.toString()))
    .map((m) => updates.get(m.id.toString())?.nationalId ?? m.nationalId)
    .concat(input.membersToCreate.map((m) => m.nationalId));
  validateNationalIds(resultingNationalIds);

  // Per-record national-ID uniqueness
  for (const update of input.membersToUpdate) {
    if (update.nationalId === undefined) continue;
    await ensureNationalIdAvailable(update.nationalId, {
      ignoreMemberId: parseId(update.id),
      allowFamilyId: input.familyId,
      deletingIds: deleting,
    });
  }
  for (const member of input.membersToCreate) {
    await ensureNationalIdAvailable(member.nationalId, {
      allowFamilyId: input.familyId,
      deletingIds: deleting,
    });
  }
};

/* ------------------------------------------------------------------ */
/* Direct employee operations — no request workflow                   */
/* ------------------------------------------------------------------ */

export const createFamilyMember = async (
  familyId: string,
  createdById: string,
  data: CreateFamilyMemberDto,
) => {
  const family = await familyRepository.findFamilyById(parseId(familyId));
  if (!family) throw new Error("Family not found");

  const validated = createFamilyMemberSchema.parse(data);

  await ensureNationalIdAvailable(validated.nationalId);

  // Exactly one HEAD invariant
  const existing = await familyMemberRepository.findFamilyMembersByFamilyId(parseId(familyId));
  ensureSingleFamilyHead([
    ...existing.map((m) => m.relationship),
    validated.relationship,
  ]);

  return familyMemberRepository.createFamilyMember(
    parseId(familyId),
    parseId(createdById),
    {
      ...validated,
      birthDate: new Date(String(validated.birthDate)),
    },
  );
};

export const updateFamilyMemberDirect = async (
  id: string,
  data: UpdateFamilyMemberDto,
) => {
  const member = await getFamilyMemberById(id);

  if (data.nationalId !== undefined) {
    await ensureNationalIdAvailable(data.nationalId, { ignoreMemberId: parseId(id) });
  }

  if (data.relationship !== undefined) {
    const siblings = await familyMemberRepository.findFamilyMembersByFamilyId(member.familyId);
    ensureSingleFamilyHead(
      siblings
        .filter((m) => m.id !== member.id)
        .map((m) => m.relationship)
        .concat([data.relationship]),
    );
  }

  const { id: _id, ...updateData } = data;
  return familyMemberRepository.updateFamilyMember(parseId(id), {
    ...updateData,
    ...(data.birthDate !== undefined && { birthDate: new Date(String(data.birthDate)) }),
  });
};

export const deleteFamilyMemberDirect = async (id: string) => {
  const member = await getFamilyMemberById(id);

  const siblings = await familyMemberRepository.findFamilyMembersByFamilyId(member.familyId);
  ensureSingleFamilyHead(
    siblings.filter((m) => m.id !== member.id).map((m) => m.relationship),
  );

  return familyMemberRepository.deleteFamilyMember(parseId(id));
};

export const getFamilyMemberById = async (id: string) => {
  const member = await familyMemberRepository.findFamilyMemberById(parseId(id));
  if (!member) throw new Error("Family member not found");
  return member;
};

export const getFamilyMembers = async (familyId: string) =>
  familyMemberRepository.findFamilyMembersByFamilyId(parseId(familyId));