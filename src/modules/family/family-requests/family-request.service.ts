import { parseId } from "../../../common/utils/parseId.js";
import { PrincipalType, type AuthUser } from "../../../common/types/auth-user.js";
import { FamilyRequestStatus, UserRole } from "../../../generated/prisma/enums.js";
import { Relationship } from "../../../generated/prisma/enums.js";
import * as authService from "../../auth/services/auth.service.js";
import * as familyMemberService from "../family-members/family-member.service.js";
import * as familyService from "../family/family.service.js";
import * as familyRequestRepository from "./family-request.repository.js";
import { cancelFamilyRequestSchema, rejectFamilyRequestSchema, updatingFamilyRequestSchema } from "./family-request.schema.js";
import type { CancelFamilyRequestDto, FamilyRequestChanges, RejectFamilyRequestDto, UpdatingFamilyRequestDto } from "./family-request.types.js";
import { buildUpdateFamilyChanges, createBeforeSnapshot, createUpdateSnapshot, serializeSnapshot, toFamilyRequestSnapshot } from "./family-request.mapper.js";

const ensureReviewer = async (reviewerId: string) => {
  const reviewer = await authService.findUserById(reviewerId);
  if (!reviewer || !reviewer.isActive || (reviewer.role !== UserRole.ADMIN && reviewer.role !== UserRole.BRANCH_MANAGER)) throw new Error("Only admin or branch manager users can review requests");
  return reviewer;
};

const ensureBranchAccess = (reviewer: { role: UserRole; branchId: bigint | null }, branchId: bigint) => {
  if (reviewer.role === UserRole.BRANCH_MANAGER && reviewer.branchId !== branchId) throw new Error("Family is outside your branch");
};

export const createUpdateRequest = async (data: UpdatingFamilyRequestDto, actor: AuthUser) => {
  if (actor.principalType !== PrincipalType.FAMILY) throw new Error("Forbidden");
  const payload = updatingFamilyRequestSchema.parse(data);
  const id = parseId(actor.sub);
  const family = await familyService.getFamilyForRequest(id.toString());
  if (!family) throw new Error("Family not found");
  if (await familyRequestRepository.findPendingRequestByFamilyId(id)) throw new Error("A pending update request already exists for this family");

  // Validate unique phone numbers before preserving the request snapshot.
  if (payload.family?.primaryPhone) {
    const existing = await familyService.findFamilyByPrimaryPhone(payload.family.primaryPhone);
    if (existing && existing.id !== id) throw new Error("Family with this primary phone already exists");
  }
  if (payload.family?.emergencyPhone) {
    const existing = await familyService.findFamilyByEmergencyPhone(payload.family.emergencyPhone);
    if (existing && existing.id !== id) throw new Error("Family with this emergency phone already exists");
  }

  const before = createBeforeSnapshot(family);
  await familyMemberService.validateMemberChanges({ familyId: id, existingMembers: family.members, membersToCreate: payload.membersToCreate, membersToUpdate: payload.membersToUpdate, membersToDelete: payload.membersToDelete });
  const familyChanges = await buildUpdateFamilyChanges(payload.family);
  const after = createUpdateSnapshot(before, payload, familyChanges);
  return familyRequestRepository.createFamilyRequest({
    familyId: id,
    title: payload.title,
    beforeData: serializeSnapshot(before),
    afterData: serializeSnapshot(after),
    ...(payload.justification !== undefined && { justification: payload.justification }),
  });
};

type FamilyRequestRecord = NonNullable<Awaited<ReturnType<typeof familyRequestRepository.findFamilyRequestById>>>;

const approveUpdateRequest = async (request: FamilyRequestRecord, reviewer: NonNullable<Awaited<ReturnType<typeof authService.findUserById>>>) => {
  const snapshot = toFamilyRequestSnapshot(request.afterData);
  const updateFamilyId = request.familyId;
  if (!updateFamilyId) throw new Error("Update request is missing its family");
  if (!(await familyService.getFamilyForRequest(updateFamilyId.toString()))) throw new Error("Family no longer exists");
  const storedChanges = snapshot.changes;
  if (!storedChanges) throw new Error("Update request is missing its changes");
  const familyData = storedChanges.family ?? {};
  const validatedChanges = updatingFamilyRequestSchema.parse({
    title: request.title,
    ...(Object.keys(familyData).length > 0 && { family: familyData }),
    ...(storedChanges.assessment && { assessment: storedChanges.assessment }),
    membersToCreate: storedChanges.membersToCreate,
    membersToUpdate: storedChanges.membersToUpdate,
    membersToDelete: storedChanges.membersToDelete,
  });
  const changes: FamilyRequestChanges = validatedChanges;
  const family = await familyService.getFamilyForRequest(updateFamilyId.toString());
  if (!family) throw new Error("Family no longer exists");
  if (changes.membersToDelete.some((memberId) =>
    family.members.some((member) => member.id.toString() === memberId && member.relationship === Relationship.HEAD)
  )) {
    throw new Error("Family head cannot be deleted");
  }
  await familyMemberService.validateMemberChanges({
    familyId: updateFamilyId,
    existingMembers: family.members,
    membersToCreate: changes.membersToCreate,
    membersToUpdate: changes.membersToUpdate,
    membersToDelete: changes.membersToDelete,
  });
  if (changes.family?.branchId) {
    const branchId = parseId(changes.family.branchId);
    const branch = await familyService.findBranchById(branchId.toString());
    if (!branch) throw new Error("Update request branch no longer exists");
    if (reviewer.role === UserRole.BRANCH_MANAGER && reviewer.branchId !== branchId) throw new Error("Branch is outside your access");
  }

  // Recheck unique phone numbers immediately before applying the request.
  if (changes.family?.primaryPhone) {
    const existing = await familyService.findFamilyByPrimaryPhone(changes.family.primaryPhone);
    if (existing && existing.id !== updateFamilyId) throw new Error("Family with this primary phone already exists");
  }
  if (changes.family?.emergencyPhone) {
    const existing = await familyService.findFamilyByEmergencyPhone(changes.family.emergencyPhone);
    if (existing && existing.id !== updateFamilyId) throw new Error("Family with this emergency phone already exists");
  }

  const { originalAddress, currentAddress, ...fields } = changes.family ?? {};
  return familyRequestRepository.approveFamilyRequest(request.id, {
    familyId: updateFamilyId,
    reviewerId: reviewer.id,
    family: {
      ...(fields.primaryPhone !== undefined || fields.emergencyPhone !== undefined || fields.branchId !== undefined
        ? { family: { ...(fields.primaryPhone !== undefined && { primaryPhone: fields.primaryPhone }), ...(fields.emergencyPhone !== undefined && { emergencyPhone: fields.emergencyPhone }), ...(fields.branchId !== undefined && { branchId: parseId(fields.branchId) }) } }
        : {}),
      ...(originalAddress || currentAddress ? { addresses: { ...(originalAddress && { originalAddress }), ...(currentAddress && { currentAddress }) } } : {}),
      ...(changes.assessment && { assessment: changes.assessment }),
    },
    members: {
      create: changes.membersToCreate,
      update: changes.membersToUpdate,
      delete: changes.membersToDelete,
    },
  });
};

export const approveRequest = async (requestId: string, reviewerId: string) => {
  const reviewer = await ensureReviewer(reviewerId);
  const request = await familyRequestRepository.findFamilyRequestById(parseId(requestId));
  if (!request) throw new Error("Family request not found");
  if (request.status !== FamilyRequestStatus.PENDING) throw new Error("Only pending requests can be approved");
  ensureBranchAccess(reviewer, request.family.branchId);
  return approveUpdateRequest(request, reviewer);
};

export const rejectRequest = async (requestId: string, reviewerId: string, data: RejectFamilyRequestDto) => {
  const reviewer = await ensureReviewer(reviewerId);
  const payload = rejectFamilyRequestSchema.parse(data);
  const id = parseId(requestId);
  const request = await familyRequestRepository.findFamilyRequestById(id);
  if (!request) throw new Error("Family request not found");
  ensureBranchAccess(reviewer, request.family.branchId);
  const result = await familyRequestRepository.rejectPendingFamilyRequest(id, reviewer.id, payload.rejectionReason);
  if (result.count !== 1) throw new Error("Request not found or is no longer pending");
  return familyRequestRepository.findFamilyRequestById(id);
};

export const cancelRequest = async (requestId: string, actor: AuthUser, data: CancelFamilyRequestDto) => {
  if (actor.principalType !== PrincipalType.FAMILY) throw new Error("Forbidden");
  const payload = cancelFamilyRequestSchema.parse(data);
  const id = parseId(requestId);
  const result = await familyRequestRepository.cancelPendingFamilyRequest(id, parseId(actor.sub), payload.reason);
  if (result.count !== 1) throw new Error("Only pending requests can be cancelled");
  return familyRequestRepository.findFamilyRequestById(id);
};

export const getRequestById = async (requestId: string, actor: AuthUser) => {
  const request = await familyRequestRepository.findFamilyRequestById(parseId(requestId));
  if (!request) throw new Error("Family request not found");
  if (actor.principalType === PrincipalType.FAMILY && request.familyId !== parseId(actor.sub)) throw new Error("Family request not found");
  if (actor.principalType === PrincipalType.USER) {
    const user = await authService.findUserById(actor.sub);
    if (!user || !user.isActive) throw new Error("Forbidden");
    if (user.role === UserRole.BRANCH_MANAGER && user.branchId !== request.family.branchId) throw new Error("Family request not found");
    if (user.role !== UserRole.ADMIN && user.role !== UserRole.BRANCH_MANAGER) throw new Error("Forbidden");
  } else if (actor.principalType !== PrincipalType.FAMILY) throw new Error("Forbidden");
  return request;
};

export const listMyRequests = async (actor: AuthUser, page = 1, limit = 20) => {
  if (actor.principalType !== PrincipalType.FAMILY) throw new Error("Forbidden");
  return familyRequestRepository.findFamilyRequestsByFamilyId(parseId(actor.sub), page, limit);
};

export const listRequests = async (actor: AuthUser, status?: FamilyRequestStatus, page = 1, limit = 20) => {
  const reviewer = await ensureReviewer(actor.sub);
  const branchId = reviewer.role === UserRole.BRANCH_MANAGER ? reviewer.branchId : undefined;
  if (reviewer.role === UserRole.BRANCH_MANAGER && !branchId) throw new Error("Branch manager is not assigned to a branch");
  return familyRequestRepository.findManyFamilyRequests({ ...(status && { status }), ...(branchId && { branchId }) }, page, limit);
};
