import { PrincipalType, type AuthUser } from "../../../common/types/auth-user.js";
import { hashRefreshToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../../../common/utils/jwt.js";
import { parseId } from "../../../common/utils/parseId.js";
import { hashPassword, verifyPassword } from "../../../common/utils/password.js";
import * as authRepository from "./auth.repository.js";
import type { ChangePasswordDto, LoginDto, RefreshDto } from "./auth.types.js";

type UserAuthRecord = NonNullable<Awaited<ReturnType<typeof authRepository.findByEmail>>>;

const toAuthUser = (user: Pick<UserAuthRecord, "id" | "role" | "branchId" | "mustChangePassword">): AuthUser => ({
  sub: user.id.toString(),
  role: user.role,
  principalType: PrincipalType.USER,
  branchId: user.branchId?.toString() ?? null,
  mustChangePassword: user.mustChangePassword,
});

export const login = async (data: LoginDto) => {
  const user = await authRepository.findByEmail(data.email);
  if (!user || !user.isActive || !(await verifyPassword(data.password, user.passwordHash))) {
    throw new Error("Invalid email or password");
  }

  const authUser = toAuthUser(user);
  const accessToken = signAccessToken(authUser);
  const refreshToken = signRefreshToken(authUser);
  if (!(await authRepository.saveRefreshToken(user.id, hashRefreshToken(refreshToken)))) {
    throw new Error("Account is deactivated");
  }
  if (!(await authRepository.updateLastLoginAt(user.id))) throw new Error("Account is deactivated");
  return { accessToken, refreshToken, mustChangePassword: user.mustChangePassword };
};

export const refresh = async (data: RefreshDto) => {
  let tokenUser: AuthUser;
  try {
    tokenUser = verifyRefreshToken(data.refreshToken);
  } catch {
    throw new Error("Invalid refresh token");
  }

  const tokenHash = hashRefreshToken(data.refreshToken);
  const user = await authRepository.findByRefreshToken(tokenHash);
  if (!user || !user.isActive || user.id.toString() !== tokenUser.sub || tokenUser.principalType !== PrincipalType.USER) {
    throw new Error("Invalid refresh token");
  }

  const authUser = toAuthUser(user);
  const nextRefreshToken = signRefreshToken(authUser);
  if (!(await authRepository.rotateRefreshToken(user.id, tokenHash, hashRefreshToken(nextRefreshToken)))) {
    throw new Error("Invalid refresh token");
  }

  return {
    accessToken: signAccessToken(authUser),
    refreshToken: nextRefreshToken,
    mustChangePassword: user.mustChangePassword,
  };
};

export const logout = async (id: string) => {
  await authRepository.removeRefreshToken(parseId(id));
  return { message: "Logged out successfully" };
};

export const changePassword = async (id: string, data: ChangePasswordDto) => {
  const user = await authRepository.findByIdWithPassword(parseId(id));
  if (!user) throw new Error("User not found");
  if (!(await verifyPassword(data.currentPassword, user.passwordHash))) {
    throw new Error("Current password is incorrect");
  }

  await authRepository.updatePassword(user.id, await hashPassword(data.newPassword));
  return { message: "Password changed successfully" };
};

export const getPasswordChangeStatus = async (id: string) =>
  authRepository.getPasswordChangeStatus(parseId(id));
