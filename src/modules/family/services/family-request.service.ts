import * as authRepository from "../../auth/repositories/auth.repository.js";
import * as branchRepository from "../../branches/repositories/branch.repository.js";
import * as familyRepository from "../repositories/family.repository.js";
import * as familyRequestRepository from "../repositories/family-request.repository.js";
import * as familyMemberService from "./family-member.service.js";
import { parseId } from "../../../common/utils/parseId.js";
import { z } from "zod";
import {
  FamilyRequestStatus,
  FamilyRequestType,
  UserRole,
} from "../../../generated/prisma/enums.js";
import type {
  CreatingFamilyRequestDto,
  UpdatingFamilyRequestDto,
  RejectFamilyRequestDto,
  CancelFamilyRequestDto,
} from "../schemas/family-request.schema.js";
import {
  creatingFamilyRequestSchema,
  updatingFamilyRequestSchema,
  rejectFamilyRequestSchema,
  cancelFamilyRequestSchema,
} from "../schemas/family-request.schema.js";
import { createFamilyMemberSchema } from "../schemas/family-member.schema.js";
import { createFamilySchema, createAssessmentSchema } from "../schemas/family.schema.js";
import type {
  FamilyRequestChanges,
  FamilyRequestSnapshot,
} from "../types/family-request.types.js";
import {
  buildUpdateFamilyChanges,
  createBeforeSnapshot,
  createRegistrationSnapshot,
  createUpdateSnapshot,
  serializeSnapshot,
  toFamilyRequestSnapshot,
} from "../mappers/family-request.mapper.js";

const ensureReviewer = async (reviewerId: string) => {
  const reviewer = await authRepository.findById(parseId(reviewerId));
  if (
    !reviewer ||
    (reviewer.role !== UserRole.ADMIN &&
      reviewer.role !== UserRole.BRANCH_MANAGER)
  ) {
    throw new Error("Only admin or branch manager users can review requests");
  }
  return reviewer;
};

const createMembersForAggregate = (
  members: CreatingFamilyRequestDto["members"],
  createdById: bigint,
) =>
  members.map((member) => ({
    createdById,
    nationalId: member.nationalId,
    fullName: member.fullName,
    gender: member.gender,
    birthDate: new Date(String(member.birthDate)),
    ...(member.phone !== undefined && { phone: member.phone }),
    relationship: member.relationship,
    ...(member.educationLevel !== undefined && {
      educationLevel: member.educationLevel,
    }),
    ...(member.educationMajor !== undefined && {
      educationMajor: member.educationMajor,
    }),
    ...(member.educationFees !== undefined && {
      educationFees: member.educationFees,
    }),
    employmentStatus: member.employmentStatus,
    monthlyIncome: member.monthlyIncome,
    hasDisability: member.hasDisability,
    ...(member.disabilityType !== undefined && {
      disabilityType: member.disabilityType,
    }),
    hasChronicDisease: member.hasChronicDisease,
    ...(member.diseaseName !== undefined && {
      diseaseName: member.diseaseName,
    }),
    maritalStatus: member.maritalStatus,
    isOrphan: member.isOrphan,
    isBasedInGaza: member.isBasedInGaza,
  }));

export const createRegistrationRequest = async (
  data: CreatingFamilyRequestDto,
  requestedById: string,
) => {
  const payload = creatingFamilyRequestSchema.parse(data);
  familyMemberService.validateNationalIds(
    payload.members.map((member) => member.nationalId),
  );
  for (const member of payload.members) {
    await familyMemberService.ensureNationalIdAvailable(member.nationalId);
  }
  const branch = await branchRepository.findById(
    parseId(payload.requestedFamily.branchId),
  );
  if (!branch) throw new Error("Branch not found");

  const existingFamily = await familyRepository.findFamilyByPhone(
    payload.requestedFamily.primaryPhone,
  );
  if (existingFamily) throw new Error("Family with this primary phone already exists");
  if (payload.requestedFamily.emergencyPhone) {
    const existingEmergency =
      await familyRepository.findFamilyByEmergencyPhone(
        payload.requestedFamily.emergencyPhone,
      );
    if (existingEmergency) {
      throw new Error("Family with this emergency phone already exists");
    }
  }

  const snapshot = await createRegistrationSnapshot(payload);

  return familyRequestRepository.createFamilyRequest({
    type: FamilyRequestType.REGISTRATION,
    requestedById: parseId(requestedById),
    title: payload.title,
    beforeData: {},
    afterData: serializeSnapshot(snapshot),
    ...(payload.justification !== undefined && {
      justification: payload.justification,
    }),
  });
};

export const createUpdateRequest = async (
  data: UpdatingFamilyRequestDto,
  familyId: string,
  requestedById: string,
) => {
  const payload = updatingFamilyRequestSchema.parse(data);
  const id = parseId(familyId);
  const family = await familyRepository.findFamilyWithEverything(id);
  if (!family) throw new Error("Family not found");
  if (payload.family?.branchId) {
    const branch = await branchRepository.findById(
      parseId(payload.family.branchId),
    );
    if (!branch) throw new Error("Branch not found");
  }
  if (await familyRequestRepository.findPendingRequestByFamilyId(id)) {
    throw new Error("A pending update request already exists for this family");
  }

  if (payload.family?.primaryPhone) {
    const existing =
      await familyRepository.findFamilyByPhone(payload.family.primaryPhone);
    if (existing && existing.id !== id) {
      throw new Error("Family with this primary phone already exists");
    }
  }
  if (payload.family?.emergencyPhone) {
    const existing =
      await familyRepository.findFamilyByEmergencyPhone(
        payload.family.emergencyPhone,
      );
    if (existing && existing.id !== id) {
      throw new Error("Family with this emergency phone already exists");
    }
  }

  const before = createBeforeSnapshot(family);
  await familyMemberService.validateMemberChanges({
    familyId: id,
    existingMembers: family.members,
    membersToCreate: payload.membersToCreate,
    membersToUpdate: payload.membersToUpdate,
    membersToDelete: payload.membersToDelete,
  });

  const familyChanges = await buildUpdateFamilyChanges(payload.family);
  const after = createUpdateSnapshot(before, payload, familyChanges);

  return familyRequestRepository.createFamilyRequest({
    type: FamilyRequestType.UPDATE,
    familyId: id,
    requestedById: parseId(requestedById),
    title: payload.title,
    beforeData: serializeSnapshot(before),
    afterData: serializeSnapshot(after),
    ...(payload.justification !== undefined && {
      justification: payload.justification,
    }),
  });
};

type FamilyRequestRecord = NonNullable<
  Awaited<ReturnType<typeof familyRequestRepository.findFamilyRequestById>>
>;

const approveRegistrationRequest = async (
  request: FamilyRequestRecord,
  reviewerId: bigint,
) => {
  const id = request.id;
  const snapshot = toFamilyRequestSnapshot(request.afterData);
  const familyData = snapshot.family;
  const familyPayload = createFamilySchema.omit({ password: true }).parse({
    ...familyData,
    originalAddress: snapshot.address.original,
    currentAddress: snapshot.address.current,
  });
  const assessmentData = createAssessmentSchema.parse(snapshot.assessment);
  const members = z.array(createFamilyMemberSchema).parse(snapshot.members);
  if (typeof familyData.passwordHash !== "string") {
    throw new Error("Registration request is missing its password hash");
  }

  const branchId = parseId(familyPayload.branchId);
  if (!(await branchRepository.findById(branchId))) {
    throw new Error("Registration request branch no longer exists");
  }

  return familyRequestRepository.approveFamilyRequest(id, reviewerId, {
    type: FamilyRequestType.REGISTRATION,
    family: {
      family: {
        branchId,
        createdById: request.requestedById,
        passwordHash: familyData.passwordHash,
        primaryPhone: familyPayload.primaryPhone,
        ...(familyPayload.emergencyPhone !== undefined && {
          emergencyPhone: familyPayload.emergencyPhone,
        }),
        originalAddress: familyPayload.originalAddress,
        currentAddress: familyPayload.currentAddress,
      },
      assessment: {
        assessedById: reviewerId,
        ...assessmentData,
      },
      members: createMembersForAggregate(members, request.requestedById),
    },
  });
};

const approveUpdateRequest = async (
  request: FamilyRequestRecord,
  reviewerId: bigint,
) => {
  const id = request.id;
  const snapshot = toFamilyRequestSnapshot(request.afterData);
  if (request.familyId === null) {
    throw new Error("Update request is missing its family");
  }
  const updateFamilyId = request.familyId;
  if (!(await familyRepository.findFamilyById(updateFamilyId))) {
    throw new Error("Family no longer exists");
  }
  const storedChanges = snapshot.changes;
  if (!storedChanges) throw new Error("Update request is missing its changes");
  const { passwordHash: storedPasswordHash, ...familyData } =
    storedChanges.family ?? {};
  const validatedChanges = updatingFamilyRequestSchema.parse({
    title: request.title,
    ...(Object.keys(familyData).length > 0 && { family: familyData }),
    ...(storedChanges.assessment && { assessment: storedChanges.assessment }),
    membersToCreate: storedChanges.membersToCreate,
    membersToUpdate: storedChanges.membersToUpdate,
    membersToDelete: storedChanges.membersToDelete,
  });
  const changes: FamilyRequestChanges = {
    ...validatedChanges,
    ...(validatedChanges.family || storedPasswordHash
      ? {
          family: {
            ...validatedChanges.family,
            ...(storedPasswordHash !== undefined && {
              passwordHash: storedPasswordHash,
            }),
          },
        }
      : {}),
  };
  if (changes.family?.branchId) {
    const branch = await branchRepository.findById(
      parseId(changes.family.branchId),
    );
    if (!branch) throw new Error("Update request branch no longer exists");
  }
  if (changes.family?.primaryPhone) {
    const existing =
      await familyRepository.findFamilyByPhone(changes.family.primaryPhone);
    if (existing && existing.id !== updateFamilyId) {
      throw new Error("Family with this primary phone already exists");
    }
  }
  if (changes.family?.emergencyPhone) {
    const existing =
      await familyRepository.findFamilyByEmergencyPhone(
        changes.family.emergencyPhone,
      );
    if (existing && existing.id !== updateFamilyId) {
      throw new Error("Family with this emergency phone already exists");
    }
  }
  const { originalAddress, currentAddress, passwordHash, ...fields } =
    changes.family ?? {};
  const familyUpdate = {
    ...(fields.primaryPhone !== undefined && {
      primaryPhone: fields.primaryPhone,
    }),
    ...(fields.emergencyPhone !== undefined && {
      emergencyPhone: fields.emergencyPhone,
    }),
    ...(fields.branchId !== undefined && {
      branchId: parseId(fields.branchId),
    }),
    ...(passwordHash !== undefined && { passwordHash }),
  };

  return familyRequestRepository.approveFamilyRequest(id, reviewerId, {
    type: FamilyRequestType.UPDATE,
    familyId: updateFamilyId,
    family: {
      ...(Object.keys(familyUpdate).length > 0 && { family: familyUpdate }),
      ...(originalAddress || currentAddress
        ? {
            addresses: {
              ...(originalAddress && { originalAddress }),
              ...(currentAddress && { currentAddress }),
            },
          }
        : {}),
      ...(changes.assessment && { assessment: changes.assessment }),
    },
    members: {
      create: changes.membersToCreate,
      update: changes.membersToUpdate,
      delete: changes.membersToDelete,
    },
  });
};

export const approveRequest = async (
  requestId: string,
  reviewerId: string,
) => {
  const reviewer = await ensureReviewer(reviewerId);
  const request = await familyRequestRepository.findFamilyRequestById(
    parseId(requestId),
  );
  if (!request) throw new Error("Family request not found");
  if (request.status !== FamilyRequestStatus.PENDING) {
    throw new Error("Only pending requests can be approved");
  }

  if (request.type === FamilyRequestType.REGISTRATION) {
    return approveRegistrationRequest(request, reviewer.id);
  }
  return approveUpdateRequest(request, reviewer.id);
};

export const rejectRequest = async (
  requestId: string,
  reviewerId: string,
  data: RejectFamilyRequestDto,
) => {
  const reviewer = await ensureReviewer(reviewerId);
  const payload = rejectFamilyRequestSchema.parse(data);
  const id = parseId(requestId);
  const result = await familyRequestRepository.rejectPendingFamilyRequest(
    id,
    reviewer.id,
    payload.rejectionReason,
  );
  if (result.count !== 1) throw new Error("Request not found or is no longer pending");
  return familyRequestRepository.findFamilyRequestById(id);
};

export const cancelRequest = async (
  requestId: string,
  ownerId: string,
  data: CancelFamilyRequestDto,
) => {
  const payload = cancelFamilyRequestSchema.parse(data);
  const id = parseId(requestId);
  const request = await familyRequestRepository.findFamilyRequestById(id);
  if (!request) throw new Error("Family request not found");
  if (request.requestedById !== parseId(ownerId)) {
    throw new Error("Only the request owner can cancel this request");
  }
  const result = await familyRequestRepository.cancelPendingFamilyRequest(
    id,
    parseId(ownerId),
    payload.reason,
  );
  if (result.count !== 1) throw new Error("Only pending requests can be cancelled");
  return familyRequestRepository.findFamilyRequestById(id);
};

export const getRequestById = async (requestId: string) => {
  const request = await familyRequestRepository.findFamilyRequestById(parseId(requestId));
  if (!request) throw new Error("Family request not found");
  return request;
};

export const listRequests = async (
  status?: FamilyRequestStatus,
  type?: FamilyRequestType,
) => familyRequestRepository.findManyFamilyRequests(status, type);
