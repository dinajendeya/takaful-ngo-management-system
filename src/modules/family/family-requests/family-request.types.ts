import type { z } from "zod";
import {
  approveFamilyRequestSchema,
  cancelFamilyRequestSchema,
  rejectFamilyRequestSchema,
  updatingFamilyRequestSchema,
} from "./family-request.schema.js";
import type { CreateFamilyMemberDto, UpdateFamilyMemberDto } from "../family-members/family-member.types.js";
import type { FamilyRequestStatus, GazaGovernorate } from "../../../generated/prisma/enums.js";
import type { FamilyUpdateAggregateData } from "../family/family.types.js";

export type UpdatingFamilyRequestDto = z.infer<typeof updatingFamilyRequestSchema>;
export type ApproveFamilyRequestDto = z.infer<typeof approveFamilyRequestSchema>;
export type RejectFamilyRequestDto = z.infer<typeof rejectFamilyRequestSchema>;
export type CancelFamilyRequestDto = z.infer<typeof cancelFamilyRequestSchema>;

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

export type FamilyRequestFilters = {
  status?: FamilyRequestStatus;
  branchId?: bigint;
};

export type FamilyMemberChanges = {
  create: CreateFamilyMemberDto[];
  update: (UpdateFamilyMemberDto & { id: string })[];
  delete: string[];
};

export type FamilyRequestApprovalData = {
  familyId: bigint;
  reviewerId: bigint;
  family: FamilyUpdateAggregateData;
  members: FamilyMemberChanges;
};

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
