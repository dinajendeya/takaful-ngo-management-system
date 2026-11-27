import { PrincipalType, type AuthUser } from "../../../common/types/auth-user.js";
import { hashRefreshToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../../../common/utils/jwt.js";
import { parseId } from "../../../common/utils/parseId.js";
import { hashPassword, verifyPassword } from "../../../common/utils/password.js";
import * as familyAuthRepository from "./family-auth.repository.js";
import type { FamilyLoginDto } from "./family-auth.types.js";

const authUser = (id: bigint): AuthUser => ({ sub: id.toString(), principalType: PrincipalType.FAMILY });

export const login = async (data: FamilyLoginDto) => {
  const family = await familyAuthRepository.findFamilyByPublicId(data.publicId);
  if (!family || !(await verifyPassword(data.password, family.passwordHash))) throw new Error("Invalid family ID or password");
  const user = authUser(family.id);
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await familyAuthRepository.updateFamilyAuth(family.id, { refreshToken: hashRefreshToken(refreshToken) });
  return { accessToken, refreshToken, mustChangePassword: family.mustChangePassword };
};

export const refresh = async (token: string) => {
  let tokenUser: AuthUser;
  try { tokenUser = verifyRefreshToken(token); } 
    catch { throw new Error("Invalid refresh token"); }
  if (tokenUser.principalType !== PrincipalType.FAMILY) throw new Error("Invalid refresh token");
  const currentHash = hashRefreshToken(token);
  const family = await familyAuthRepository.findFamilyByRefreshToken(currentHash);
  if (!family || family.id !== parseId(tokenUser.sub)) throw new Error("Invalid refresh token");
  const nextToken = signRefreshToken(authUser(family.id));
  if (!(await familyAuthRepository.rotateFamilyRefreshToken(family.id, currentHash, hashRefreshToken(nextToken)))) throw new Error("Invalid refresh token");
  return { accessToken: signAccessToken(authUser(family.id)), refreshToken: nextToken };
};

export const logout = async (id: string) => {
  await familyAuthRepository.updateFamilyAuth(parseId(id), { refreshToken: null });
  return { message: "Logged out successfully" };
};

export const me = async (id: string) => {
  const family = await familyAuthRepository.findFamilyById(parseId(id));
  if (!family) throw new Error("Family not found");
  return family;
};

export const changePassword = async (id: string, currentPassword: string, newPassword: string) => {
  const family = await familyAuthRepository.findFamilyByIdForAuth(parseId(id));
  if (!family) throw new Error("Family not found");
  if (!(await verifyPassword(currentPassword, family.passwordHash))) throw new Error("Current password is incorrect");
  await familyAuthRepository.updateFamilyAuth(family.id, { passwordHash: await hashPassword(newPassword), mustChangePassword: false });
  return { message: "Password changed successfully" };
};

export const getPasswordChangeStatus = async (id: string) =>
  familyAuthRepository.findFamilyPasswordStatus(parseId(id));
