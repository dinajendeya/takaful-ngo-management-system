import { parseId } from "../../../common/utils/parseId.js";
import { PrincipalType, type AuthUser } from "../../../common/types/auth-user.js";
import * as familyRepository from "../repositories/family.repository.js";
import { createAssessmentSchema, updateAssessmentSchema } from "../schemas/family.schema.js";
import { assertFamilyAccess } from "./family.service.js";

export const createAssessment = async (familyId: string, data: unknown, actor: AuthUser) => {
  const id = parseId(familyId);
  await assertFamilyAccess(id, actor, true);
  if (actor.principalType !== PrincipalType.USER) throw new Error("Forbidden");
  if (await familyRepository.findAssessmentByFamilyId(id)) throw new Error("Family assessment already exists");
  const payload = createAssessmentSchema.parse(data);
  return familyRepository.createAssessment({ ...payload, assessedById: parseId(actor.sub), familyId: id });
};

export const getAssessment = async (familyId: string, actor: AuthUser) => {
  const id = parseId(familyId);
  await assertFamilyAccess(id, actor);
  const assessment = await familyRepository.findAssessmentByFamilyId(id);
  if (!assessment) throw new Error("Family assessment not found");
  return assessment;
};

export const updateAssessment = async (familyId: string, data: unknown, actor: AuthUser) => {
  const id = parseId(familyId);
  await assertFamilyAccess(id, actor, true);
  if (actor.principalType !== PrincipalType.USER) throw new Error("Forbidden");
  const payload = updateAssessmentSchema.parse(data);
  const current = await familyRepository.findAssessmentByFamilyId(id);
  if (!current) throw new Error("Family assessment not found");
  return familyRepository.updateAssessmentByFamilyId(id, { ...payload, assessedById: parseId(actor.sub) });
};
