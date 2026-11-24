import { PrincipalType, type AuthUser } from "../../../common/types/auth-user.js";
import { hashRefreshToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../../../common/utils/jwt.js";
import { parseId } from "../../../common/utils/parseId.js";
import { hashPassword, verifyPassword } from "../../../common/utils/password.js";
import * as familyRepository from "../repositories/family.repository.js";
import type { FamilyLoginDto } from "../schemas/family-auth.schema.js";

const authUser = (id: bigint): AuthUser => ({ sub: id.toString(), principalType: PrincipalType.FAMILY });

export const login = async (data: FamilyLoginDto) => {
  const family = await familyRepository.findFamilyByPublicId(data.publicId);
  if (!family || !(await verifyPassword(data.password, family.passwordHash))) throw new Error("Invalid family ID or password");
  const user = authUser(family.id);
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await familyRepository.updateFamilyAuth(family.id, { refreshToken: hashRefreshToken(refreshToken) });
  return { accessToken, refreshToken, mustChangePassword: family.mustChangePassword };
};

export const refresh = async (token: string) => {
  let tokenUser: AuthUser;
  try { tokenUser = verifyRefreshToken(token); } catch { throw new Error("Invalid refresh token"); }
  if (tokenUser.principalType !== PrincipalType.FAMILY) throw new Error("Invalid refresh token");
  const currentHash = hashRefreshToken(token);
  const family = await familyRepository.findFamilyByRefreshToken(currentHash);
  if (!family || family.id !== parseId(tokenUser.sub)) throw new Error("Invalid refresh token");
  const nextToken = signRefreshToken(authUser(family.id));
  if (!(await familyRepository.rotateFamilyRefreshToken(family.id, currentHash, hashRefreshToken(nextToken)))) throw new Error("Invalid refresh token");
  return { accessToken: signAccessToken(authUser(family.id)), refreshToken: nextToken };
};

export const logout = async (id: string) => {
  await familyRepository.updateFamilyAuth(parseId(id), { refreshToken: null });
  return { message: "Logged out successfully" };
};

export const me = async (id: string) => {
  const family = await familyRepository.findFamilyById(parseId(id));
  if (!family) throw new Error("Family not found");
  return family;
};

export const changePassword = async (id: string, currentPassword: string, newPassword: string) => {
  const family = await familyRepository.findFamilyByIdForAuth(parseId(id));
  if (!family) throw new Error("Family not found");
  if (!(await verifyPassword(currentPassword, family.passwordHash))) throw new Error("Current password is incorrect");
  await familyRepository.updateFamilyAuth(family.id, { passwordHash: await hashPassword(newPassword), mustChangePassword: false });
  return { message: "Password changed successfully" };
};
