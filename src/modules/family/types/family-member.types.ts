import type {
  CreateFamilyMemberDto,
  UpdateFamilyMemberDto,
} from "../schemas/family-member.schema.js";

export type FamilyMemberChanges = {
  create: CreateFamilyMemberDto[];
  update: (UpdateFamilyMemberDto & { id: string })[];
  delete: string[];
};
