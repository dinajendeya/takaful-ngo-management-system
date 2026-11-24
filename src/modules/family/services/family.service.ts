import { randomBytes } from "node:crypto";
import { hashPassword } from "../../../common/utils/password.js";
import { parseId } from "../../../common/utils/parseId.js";
import { FamilyStatus, UserRole } from "../../../generated/prisma/enums.js";
import { PrincipalType, type AuthUser } from "../../../common/types/auth-user.js";
import { findById as findUserById } from "../../auth/repositories/auth.repository.js";
import * as familyRepository from "../repositories/family.repository.js";
import { createEmployeeFamilySchema, updateFamilySchema, type CreateEmployeeFamilyDto, type UpdateFamilyDto } from "../schemas/family.schema.js";

const isFamilyStaffRole = (role: UserRole) => role === UserRole.ADMIN || role === UserRole.BRANCH_MANAGER || role === UserRole.FIELD_RESEARCHER;

const getStaffActor = async (actor: AuthUser) => {
  if (actor.principalType !== PrincipalType.USER) throw new Error("Forbidden");
  const user = await findUserById(parseId(actor.sub));
  if (!user || !user.isActive || !isFamilyStaffRole(user.role)) throw new Error("Forbidden");
  return user;
};

export const assertFamilyAccess = async (familyId: bigint, actor: AuthUser, edit = false) => {
  const family = await familyRepository.findFamilyById(familyId);
  if (!family) throw new Error("Family not found");
  if (actor.principalType === PrincipalType.FAMILY) {
    if (parseId(actor.sub) !== family.id || edit) throw new Error("Forbidden");
    return family;
  }
  const user = await getStaffActor(actor);
  if (user.role === UserRole.BRANCH_MANAGER && user.branchId !== family.branchId) throw new Error("Family is outside your branch");
  if (edit && user.role === UserRole.FIELD_RESEARCHER && family.status !== FamilyStatus.PENDING) throw new Error("Field researchers can only edit pending families");
  return family;
};

export const createFamily = async (data: CreateEmployeeFamilyDto, actor: AuthUser) => {
  const user = await getStaffActor(actor);
  const payload = createEmployeeFamilySchema.parse(data);
  const branchId = parseId(payload.branchId);
  const branch = await familyRepository.findBranch(branchId);
  if (!branch) throw new Error("Branch not found");
  if (user.role === UserRole.BRANCH_MANAGER && user.branchId !== branchId) throw new Error("Branch is outside your access");
  if (await familyRepository.findFamilyByPhone(payload.primaryPhone)) throw new Error("Family with this primary phone already exists");
  if (payload.emergencyPhone && await familyRepository.findFamilyByEmergencyPhone(payload.emergencyPhone)) throw new Error("Family with this emergency phone already exists");
  const temporaryPassword = randomBytes(9).toString("base64url");
  const passwordHash = await hashPassword(temporaryPassword);
  const family = await familyRepository.createFamily({
    branchId,
    createdById: user.id,
    passwordHash,
    primaryPhone: payload.primaryPhone,
    ...(payload.emergencyPhone !== undefined && { emergencyPhone: payload.emergencyPhone }),
    originalAddress: payload.originalAddress,
    currentAddress: payload.currentAddress,
  });
  return { family, temporaryPassword };
};

export const getFamilyById = async (id: string, actor: AuthUser) => assertFamilyAccess(parseId(id), actor);

export const getFamilies = async (filters: { status?: FamilyStatus; branchId?: string; primaryPhone?: string } = {}, page = 1, limit = 20, actor: AuthUser) => {
  const user = await getStaffActor(actor);
  const branchId = user.role === UserRole.BRANCH_MANAGER ? user.branchId ?? undefined : filters.branchId ? parseId(filters.branchId) : undefined;
  if (user.role === UserRole.BRANCH_MANAGER && !branchId) throw new Error("Branch manager is not assigned to a branch");
  if (user.role === UserRole.BRANCH_MANAGER && filters.branchId && parseId(filters.branchId) !== branchId) throw new Error("Branch is outside your access");
  return familyRepository.findManyFamilies({ ...(filters.status && { status: filters.status }), ...(branchId && { branchId }), ...(filters.primaryPhone && { primaryPhone: filters.primaryPhone }) }, page, limit);
};

export const updateFamily = async (id: string, data: UpdateFamilyDto, actor: AuthUser) => {
  const familyId = parseId(id);
  const user = actor.principalType === PrincipalType.USER ? await getStaffActor(actor) : undefined;
  await assertFamilyAccess(familyId, actor, true);
  const payload = updateFamilySchema.parse(data);
  if (payload.branchId) {
    const branchId = parseId(payload.branchId);
    if (!(await familyRepository.findBranch(branchId))) throw new Error("Branch not found");
    if (user?.role === UserRole.BRANCH_MANAGER && user.branchId !== branchId) throw new Error("Branch is outside your access");
  }
  if (payload.primaryPhone) {
    const existing = await familyRepository.findFamilyByPhone(payload.primaryPhone);
    if (existing && existing.id !== familyId) throw new Error("Family with this primary phone already exists");
  }
  if (payload.emergencyPhone) {
    const existing = await familyRepository.findFamilyByEmergencyPhone(payload.emergencyPhone);
    if (existing && existing.id !== familyId) throw new Error("Family with this emergency phone already exists");
  }
  const { originalAddress, currentAddress, password, branchId, ...fields } = payload;
  const passwordHash = password ? await hashPassword(password) : undefined;
  await familyRepository.updateFamilyAggregate(familyId, {
    ...(Object.keys(fields).length || passwordHash || branchId ? { family: { ...fields, ...(passwordHash && { passwordHash }), ...(branchId && { branchId: parseId(branchId) }) } } : {}),
    ...(originalAddress || currentAddress ? { addresses: { ...(originalAddress && { originalAddress }), ...(currentAddress && { currentAddress }) } } : {}),
  });
  return familyRepository.findFamilyById(familyId);
};

export const verifyFamily = async (familyId: string, verifiedById: string, actor: AuthUser) => {
  const family = await assertFamilyAccess(parseId(familyId), actor, true);
  const user = await getStaffActor(actor);
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.BRANCH_MANAGER) throw new Error("Forbidden");
  if (family.status === FamilyStatus.VERIFIED) throw new Error("Family is already verified");
  if (family.status === FamilyStatus.REJECTED) throw new Error("Rejected family cannot be verified");
  return familyRepository.verifyFamily(family.id, parseId(verifiedById));
};

export const rejectFamily = async (familyId: string, verifiedById: string, actor: AuthUser) => {
  const family = await assertFamilyAccess(parseId(familyId), actor, true);
  const user = await getStaffActor(actor);
  if (user.role !== UserRole.ADMIN && user.role !== UserRole.BRANCH_MANAGER) throw new Error("Forbidden");
  if (family.status === FamilyStatus.VERIFIED) throw new Error("Verified family cannot be rejected");
  return familyRepository.rejectFamily(family.id, parseId(verifiedById));
};

export const softDeleteFamily = async (familyId: string, actor: AuthUser) => {
  const user = await getStaffActor(actor);
  if (user.role !== UserRole.ADMIN) throw new Error("Forbidden");
  const family = await familyRepository.findFamilyById(parseId(familyId));
  if (!family) throw new Error("Family not found");
  return familyRepository.softDeleteFamily(family.id);
};
