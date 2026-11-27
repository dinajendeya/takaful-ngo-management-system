import * as familyMemberRepository from "../repositories/family-member.repository.js";
import { parseId } from "../../../common/utils/parseId.js";
import { Relationship } from "../../../generated/prisma/enums.js";
import { PrincipalType, type AuthUser } from "../../../common/types/auth-user.js";
import { createFamilyMemberSchema, type CreateFamilyMemberDto, type UpdateFamilyMemberDto } from "../schemas/family-member.schema.js";
import { assertFamilyAccess } from "./family.service.js";

export const ensureNationalIdAvailable = async (nationalId: string, options: { ignoreMemberId?: bigint; allowFamilyId?: bigint; deletingIds?: Set<string> } = {}) => {
  const existing = await familyMemberRepository.findFamilyMemberByNationalId(nationalId);
  if (!existing) return;

  // Allow the member keeping its own national ID.
  if (options.ignoreMemberId !== undefined && existing.id === options.ignoreMemberId) return;

  // Allow reusing an ID when its current member is being deleted.
  if (options.allowFamilyId !== undefined && existing.familyId === options.allowFamilyId && options.deletingIds?.has(existing.id.toString())) {
    return;
  }

  throw new Error("National ID already exists");
};

export const ensureMembersBelongToFamily = (familyMemberIds: Set<string>, requestedIds: bigint[]) => {
  if (requestedIds.some((memberId) => !familyMemberIds.has(memberId.toString()))) {
    throw new Error("Requested member change does not belong to this family");
  }
};

export const ensureNoDuplicateMemberOperations = (updateIds: bigint[], deleteIds: bigint[]) => {
  const updateSet = new Set(updateIds.map(String));
  const deleteSet = new Set(deleteIds.map(String));
  if (updateSet.size !== updateIds.length || deleteSet.size !== deleteIds.length || [...updateSet].some((id) => deleteSet.has(id))) {
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

export const createFamilyMember = async (familyId: string, actor: AuthUser, data: CreateFamilyMemberDto) => {
  const parsedFamilyId = parseId(familyId);
  await assertFamilyAccess(parsedFamilyId, actor, true);
  if (actor.principalType !== PrincipalType.USER) throw new Error("Forbidden");

  const validated = createFamilyMemberSchema.parse(data);

  await ensureNationalIdAvailable(validated.nationalId);

  // Preserve exactly one family head.
  const existing = await familyMemberRepository.findFamilyMembersByFamilyId(parseId(familyId));
  ensureSingleFamilyHead([
    ...existing.map((m) => m.relationship),
    validated.relationship,
  ]);

  return familyMemberRepository.createFamilyMember(
    parsedFamilyId,
    parseId(actor.sub),
    {
      ...validated,
      birthDate: new Date(String(validated.birthDate)),
    },
  );
};

export const updateFamilyMemberDirect = async (familyId: string, id: string, data: UpdateFamilyMemberDto, actor: AuthUser) => {
  const member = await getFamilyMemberById(id);
  if (member.familyId !== parseId(familyId)) throw new Error("Family member not found");
  await assertFamilyAccess(member.familyId, actor, true);
  if (actor.principalType !== PrincipalType.USER) throw new Error("Forbidden");

  if (data.nationalId !== undefined) await ensureNationalIdAvailable(data.nationalId, { ignoreMemberId: parseId(id) });

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

export const deleteFamilyMemberDirect = async (familyId: string, id: string, actor: AuthUser) => {
  const member = await getFamilyMemberById(id);
  if (member.familyId !== parseId(familyId)) throw new Error("Family member not found");
  await assertFamilyAccess(member.familyId, actor, true);
  if (actor.principalType !== PrincipalType.USER) throw new Error("Forbidden");

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

export const getFamilyMembers = async (familyId: string, actor: AuthUser, page = 1, limit = 20) => {
  await assertFamilyAccess(parseId(familyId), actor);
  return familyMemberRepository.findManyFamilyMembersByFamilyId(parseId(familyId), page, limit);
};

export const getFamilyMember = async (familyId: string, memberId: string, actor: AuthUser) => {
  await assertFamilyAccess(parseId(familyId), actor);
  const member = await getFamilyMemberById(memberId);
  if (member.familyId !== parseId(familyId)) throw new Error("Family member not found");
  return member;
};