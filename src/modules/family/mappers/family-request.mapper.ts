import type { UpdatingFamilyRequestDto } from "../schemas/family-request.schema.js";
import type {
  FamilyRequestChanges,
  FamilyRequestSnapshot,
} from "../types/family-request.types.js";
import * as familyRepository from "../repositories/family.repository.js";

export const serializeSnapshot = (value: unknown) =>
  JSON.parse(JSON.stringify(value, (_, item) =>
    typeof item === "bigint" ? item.toString() : item,
  ));

export const createBeforeSnapshot = (
  family: NonNullable<
    Awaited<ReturnType<typeof familyRepository.findFamilyWithEverything>>
  >,
): FamilyRequestSnapshot => {
  const {
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

export const buildUpdateFamilyChanges = async (
  family: UpdatingFamilyRequestDto["family"],
): Promise<FamilyRequestChanges["family"]> => {
  return family;
};

export const createUpdateSnapshot = (
  before: FamilyRequestSnapshot,
  payload: UpdatingFamilyRequestDto,
  familyChanges: FamilyRequestChanges["family"],
): FamilyRequestSnapshot => {
  const deleting = new Set(payload.membersToDelete);
  const updates = new Map(
    payload.membersToUpdate.map((member) => [member.id, member]),
  );
  return {
    ...before,
    family: {
      ...before.family,
      ...familyChanges,
    },
    address: {
      original: {
        ...before.address.original,
        ...payload.family?.originalAddress,
      },
      current: {
        ...before.address.current,
        ...payload.family?.currentAddress,
      },
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
};

export const toFamilyRequestSnapshot = (data: unknown) =>
  data as FamilyRequestSnapshot;
