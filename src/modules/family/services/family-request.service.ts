import * as authRepository from "../../auth/repositories/auth.repository.js";
import * as branchRepository from "../../branches/repositories/branch.repository.js";
import * as familyMemberRepository from "../repositories/family-member.repository.js";
import * as familyRepository from "../repositories/family.repository.js";
import * as familyRequestRepository from "../repositories/family-request.repository.js";
import { hashPassword } from "../../../common/utils/password.js";
import { parseId } from "../../../common/utils/parseId.js";
import { z } from "zod";
import {
  FamilyRequestStatus,
  FamilyRequestType,
  Relationship,
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
import type { CreateFamilyMemberDto } from "../schemas/family-member.schema.js";
import { createFamilyMemberSchema } from "../schemas/family-member.schema.js";
import { createFamilySchema, createAssessmentSchema } from "../schemas/family.schema.js";

type SnapshotMember = Record<string, unknown> & { id?: string | bigint };
type AddressSnapshot = {
  id?: string | bigint;
  governorate: CreatingFamilyRequestDto["requestedFamily"]["originalAddress"]["governorate"];
  city: string;
  neighborhood?: string | null;
  street?: string | null;
  nearbyLandmark?: string | null;
  additionalDetails?: string | null;
};

type AssessmentSnapshot = {
  monthlyFamilyIncome: number | string;
  rentCost?: number | string | null;
  housingType: CreatingFamilyRequestDto["assessedFamily"]["housingType"];
  isDisplaced: boolean;
  isRegisteredInCamp: boolean;
  hasElectricity: boolean;
  hasInternet: boolean;
  notes?: string | null;
};

type RequestChanges = {
  family?: UpdatingFamilyRequestDto["family"] & { passwordHash?: string };
  assessment?: UpdatingFamilyRequestDto["assessment"];
  membersToCreate: CreateFamilyMemberDto[];
  membersToUpdate: UpdatingFamilyRequestDto["membersToUpdate"];
  membersToDelete: string[];
};

type FamilyRequestSnapshot = {
  family: Record<string, unknown> & {
    branchId?: string | bigint;
    passwordHash?: string;
    primaryPhone?: string;
    emergencyPhone?: string | null;
  };
  address: {
    original: AddressSnapshot;
    current: AddressSnapshot;
  };
  assessment: AssessmentSnapshot | null;
  members: SnapshotMember[];
  changes?: RequestChanges;
};

type FamilyUpdateRequestChanges = NonNullable<RequestChanges["family"]>;

const serializeSnapshot = (value: unknown) =>
  JSON.parse(JSON.stringify(value, (_, item) =>
    typeof item === "bigint" ? item.toString() : item,
  ));

const snapshotFamily = (
  family: NonNullable<
    Awaited<ReturnType<typeof familyRepository.findFamilyWithEverything>>
  >,
) => {
  const {
    passwordHash: _passwordHash,
    originalAddress,
    currentAddress,
    assessment,
    members,
    ...familyData
  } = family;
  return {
    family: familyData,
    address: { original: originalAddress, current: currentAddress },
    assessment,
    members,
  };
};

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

const validateNationalIds = (nationalIds: string[]) => {
  if (new Set(nationalIds).size !== nationalIds.length) {
    throw new Error("National IDs must be unique");
  }
};

export const createRegistrationRequest = async (
  data: CreatingFamilyRequestDto,
  requestedById: string,
) => {
  const payload = creatingFamilyRequestSchema.parse(data);
  validateNationalIds(payload.members.map((member) => member.nationalId));
  for (const member of payload.members) {
    if (await familyMemberRepository.findFamilyMemberByNationalId(member.nationalId)) {
      throw new Error("National ID already exists");
    }
  }
  const branch = await branchRepository.findById(
    parseId(payload.requestedFamily.branchId),
  );
  if (!branch) throw new Error("Branch not found");

  const existingFamily = await familyRepository.findFamilyByPhone(
    payload.requestedFamily.primaryPhone,
  );
  if (existingFamily) throw new Error("Family with this primary phone already exists");

  const snapshot = {
    family: {
      branchId: payload.requestedFamily.branchId,
      passwordHash: await hashPassword(payload.requestedFamily.password),
      primaryPhone: payload.requestedFamily.primaryPhone,
      emergencyPhone: payload.requestedFamily.emergencyPhone,
    },
    address: {
      original: payload.requestedFamily.originalAddress,
      current: payload.requestedFamily.currentAddress,
    },
    assessment: payload.assessedFamily,
    members: payload.members,
  };

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

  const before = snapshotFamily(family);
  const updateIds = payload.membersToUpdate.map((member) => parseId(member.id));
  const deleteIds = payload.membersToDelete.map(parseId);
  const memberIds = new Set(family.members.map((member) => member.id.toString()));

  if (
    [...updateIds, ...deleteIds].some((memberId) => !memberIds.has(memberId.toString()))
  ) {
    throw new Error("Requested member change does not belong to this family");
  }
  if (new Set(updateIds.map(String)).size !== updateIds.length ||
    new Set(deleteIds.map(String)).size !== deleteIds.length ||
    updateIds.some((memberId) => deleteIds.includes(memberId))) {
    throw new Error("A family member can only be changed once per request");
  }

  const deleting = new Set(deleteIds.map(String));
  const updates = new Map(
    payload.membersToUpdate.map((member) => [member.id, member]),
  );
  const resultingRelationships = family.members
    .filter((member) => !deleting.has(member.id.toString()))
    .map((member) =>
      updates.get(member.id.toString())?.relationship ?? member.relationship,
    )
    .concat(payload.membersToCreate.map((member) => member.relationship));
  if (resultingRelationships.filter((value) => value === Relationship.HEAD).length !== 1) {
    throw new Error("A family must have exactly one head after the requested changes");
  }
  const memberUpdates = new Map(
    payload.membersToUpdate.map((member) => [member.id, member]),
  );
  const resultingNationalIds = family.members
    .filter((member) => !deleting.has(member.id.toString()))
    .map((member) =>
      memberUpdates.get(member.id.toString())?.nationalId ?? member.nationalId,
    )
    .concat(payload.membersToCreate.map((member) => member.nationalId));
  validateNationalIds(resultingNationalIds);

  for (const update of payload.membersToUpdate) {
    if (update.nationalId === undefined) continue;
    const existing = await familyMemberRepository.findFamilyMemberByNationalId(
      update.nationalId,
    );
    if (
      existing &&
      existing.id.toString() !== update.id &&
      !(existing.familyId === id && deleting.has(existing.id.toString()))
    ) {
      throw new Error("National ID already exists");
    }
  }
  for (const member of payload.membersToCreate) {
    const existing = await familyMemberRepository.findFamilyMemberByNationalId(
      member.nationalId,
    );
    if (
      existing &&
      !(existing.familyId === id && deleting.has(existing.id.toString()))
    ) {
      throw new Error("National ID already exists");
    }
  }

  const { password, ...familyFields } = payload.family ?? {};
  const familyChanges: FamilyUpdateRequestChanges | undefined = payload.family
    ? {
        ...familyFields,
        ...(password !== undefined && {
          passwordHash: await hashPassword(password),
        }),
      }
    : undefined;
  const { passwordHash, ...familyAfterChanges } = familyChanges ?? {};
  const after = {
    ...before,
    family: {
      ...before.family,
      ...familyAfterChanges,
      ...(passwordHash !== undefined && { passwordHash }),
    },
    address: {
      original: { ...before.address.original, ...payload.family?.originalAddress },
      current: { ...before.address.current, ...payload.family?.currentAddress },
    },
    assessment: before.assessment
      ? { ...before.assessment, ...payload.assessment }
      : payload.assessment ?? null,
    members: [
      ...before.members
        .filter((member) => !deleting.has(String(member.id)))
        .map((member) => ({
          ...member,
          ...updates.get(String(member.id)),
        })),
        ...payload.membersToCreate,
    ],
    changes: {
      ...(familyChanges && { family: familyChanges }),
        ...(payload.assessment && { assessment: payload.assessment }),
      membersToCreate: payload.membersToCreate,
        membersToUpdate: payload.membersToUpdate,
        membersToDelete: payload.membersToDelete,
    },
  };

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

const toSnapshot = (data: unknown) =>
  data as FamilyRequestSnapshot;

export const approveRequest = async (
  requestId: string,
  reviewerId: string,
) => {
  const reviewer = await ensureReviewer(reviewerId);
  const id = parseId(requestId);
  const request = await familyRequestRepository.findFamilyRequestById(id);
  if (!request) throw new Error("Family request not found");
  if (request.status !== FamilyRequestStatus.PENDING) {
    throw new Error("Only pending requests can be approved");
  }

  const snapshot = toSnapshot(request.afterData);
  if (request.type === FamilyRequestType.REGISTRATION) {
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

    return familyRequestRepository.approveFamilyRequest(id, reviewer.id, {
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
          assessedById: reviewer.id,
          ...assessmentData,
        },
        members: createMembersForAggregate(members, request.requestedById),
      },
    });
  }

  if (request.familyId === null) {
    throw new Error("Update request is missing its family");
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
  const changes: RequestChanges = {
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

  return familyRequestRepository.approveFamilyRequest(id, reviewer.id, {
    type: FamilyRequestType.UPDATE,
    familyId: request.familyId,
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
      create: changes.membersToCreate.map((member) => ({
        ...member,
        birthDate: new Date(String(member.birthDate)),
      })),
      update: changes.membersToUpdate.map(({ id: memberId, ...data }) => ({
        id: parseId(memberId),
        data: {
          ...data,
          ...(data.birthDate !== undefined && {
            birthDate: new Date(String(data.birthDate)),
          }),
        },
      })),
      delete: changes.membersToDelete.map(parseId),
    },
  });
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
