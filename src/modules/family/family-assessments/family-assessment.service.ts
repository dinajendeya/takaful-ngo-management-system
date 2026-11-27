import { parseId } from "../../../common/utils/parseId.js";
import { PrincipalType, type AuthUser } from "../../../common/types/auth-user.js";
import * as assessmentRepository from "./family-assessment.repository.js";
import { createAssessmentSchema, updateAssessmentSchema } from "./family-assessment.schema.js";
import { assertFamilyAccess } from "../family/family.service.js";

export const createAssessment = async (familyId: string, data: unknown, actor: AuthUser) => {
  const id = parseId(familyId);
  await assertFamilyAccess(id, actor, true);
  if (actor.principalType !== PrincipalType.USER) throw new Error("Forbidden");
  if (await assessmentRepository.findAssessmentByFamilyId(id)) throw new Error("Family assessment already exists");
  const payload = createAssessmentSchema.parse(data);
  return assessmentRepository.createAssessment({ ...payload, assessedById: parseId(actor.sub), familyId: id });
};

export const getAssessment = async (familyId: string, actor: AuthUser) => {
  const id = parseId(familyId);
  await assertFamilyAccess(id, actor);
  const assessment = await assessmentRepository.findAssessmentByFamilyId(id);
  if (!assessment) throw new Error("Family assessment not found");
  return assessment;
};

export const updateAssessment = async (familyId: string, data: unknown, actor: AuthUser) => {
  const id = parseId(familyId);
  await assertFamilyAccess(id, actor, true);
  if (actor.principalType !== PrincipalType.USER) throw new Error("Forbidden");
  const payload = updateAssessmentSchema.parse(data);
  const current = await assessmentRepository.findAssessmentByFamilyId(id);
  if (!current) throw new Error("Family assessment not found");
  return assessmentRepository.updateAssessmentByFamilyId(id, { ...payload, assessedById: parseId(actor.sub) });
};
