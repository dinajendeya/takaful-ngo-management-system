import { FamilyRequestType } from "../../../generated/prisma/enums.js";
import type {
  CreatingFamilyRequestDto,
  UpdatingFamilyRequestDto,
} from "../schemas/family-request.schema.js";
import type { CreateFamilyMemberDto } from "../schemas/family-member.schema.js";
import type {
  CreateFamilyAggregateData,
  FamilyUpdateAggregateData,
} from "./family.types.js";
import type { FamilyMemberChanges } from "./family-member.types.js";

export type FamilyRequestSnapshot = {
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
  assessment: Record<string, unknown> | null;
  members: SnapshotMember[];
  changes?: FamilyRequestChanges;
};

export type FamilyRequestChanges = {
  family?: UpdatingFamilyRequestDto["family"] & { passwordHash?: string };
  assessment?: UpdatingFamilyRequestDto["assessment"];
  membersToCreate: CreateFamilyMemberDto[];
  membersToUpdate: UpdatingFamilyRequestDto["membersToUpdate"];
  membersToDelete: string[];
};

export type FamilyRequestApprovalData =
  | {
      type: typeof FamilyRequestType.REGISTRATION;
      family: CreateFamilyAggregateData;
    }
  | {
      type: typeof FamilyRequestType.UPDATE;
      familyId: bigint;
      family: FamilyUpdateAggregateData;
      members: FamilyMemberChanges;
    };

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
