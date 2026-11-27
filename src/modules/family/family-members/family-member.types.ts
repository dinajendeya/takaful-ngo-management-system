import type { Relationship } from "../../../generated/prisma/enums.js";
import type { z } from "zod";
import type { createFamilyMemberSchema, createFamilyMembersSchema, updateFamilyMemberSchema } from "./family-member.schema.js";

export type CreateFamilyMemberDto = z.infer<typeof createFamilyMemberSchema>;
export type UpdateFamilyMemberDto = z.infer<typeof updateFamilyMemberSchema>;
export type CreateFamilyMembersDTO = z.infer<typeof createFamilyMembersSchema>;

export type MemberChangesInput = {
  familyId: bigint;
  existingMembers: { id: bigint; nationalId: string; relationship: Relationship }[];
  membersToCreate: CreateFamilyMemberDto[];
  membersToUpdate: (UpdateFamilyMemberDto & { id: string })[];
  membersToDelete: string[];
};
