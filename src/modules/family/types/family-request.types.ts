import type { UpdatingFamilyRequestDto } from "../schemas/family-request.schema.js";
import type { CreateFamilyMemberDto } from "../schemas/family-member.schema.js";
import type { GazaGovernorate } from "../../../generated/prisma/enums.js";
import type { FamilyUpdateAggregateData } from "./family.types.js";
import type { FamilyMemberChanges } from "./family-member.types.js";

export type FamilyRequestSnapshot = {
  family: Record<string, unknown> & {
    branchId?: string | bigint;
    primaryPhone?: string;
    emergencyPhone?: string | null;
  };
  address: {
    original: AddressSnapshot;
    current: AddressSnapshot;
  };
  assessment: Record<string, unknown> | null;
  members: SnapshotMember[];
  changes?: FamilyRequestChanges;
};

export type FamilyRequestChanges = {
  family?: UpdatingFamilyRequestDto["family"];
  assessment?: UpdatingFamilyRequestDto["assessment"];
  membersToCreate: CreateFamilyMemberDto[];
  membersToUpdate: UpdatingFamilyRequestDto["membersToUpdate"];
  membersToDelete: string[];
};

export type FamilyRequestApprovalData =
  { familyId: bigint; family: FamilyUpdateAggregateData; members: FamilyMemberChanges };

type SnapshotMember = Record<string, unknown> & { id?: string | bigint };
type AddressSnapshot = {
  id?: string | bigint;
  governorate: GazaGovernorate;
  city: string;
  neighborhood?: string | null;
  street?: string | null;
  nearbyLandmark?: string | null;
  additionalDetails?: string | null;
};
