import * as authRepository from "../repositories/auth.repository.js";
import { hashRefreshToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../../../common/utils/jwt.js";
import { hashPassword, verifyPassword } from "../../../common/utils/password.js";
import { PrincipalType, type AuthUser } from "../../../common/types/auth-user.js";
import { parseId } from "../../../common/utils/parseId.js";
import type { LoginDto, RefreshDto, CreateUserDto, ChangePasswordDto } from "../schemas/auth.schema.js";

const toAuthUser = (user: { id: bigint; email: string; role: NonNullable<AuthUser["role"]>; branchId: bigint | null }): AuthUser => ({
  sub: user.id.toString(),
  role: user.role,
  principalType: PrincipalType.USER,
  branchId: user.branchId?.toString() ?? null,
});

export const login = async (data: LoginDto) => {
  const user = await authRepository.findByEmail(data.email);
  if (!user || !user.isActive || !(await verifyPassword(data.password, user.passwordHash))) {
    throw new Error("Invalid email or password");
  }
  
  const authUser = toAuthUser(user);
  const accessToken = signAccessToken(authUser);
  const refreshToken = signRefreshToken(authUser);
  const saved = await authRepository.saveRefreshToken(user.id, hashRefreshToken(refreshToken));
  if (!saved) throw new Error("Account is deactivated");
  return { accessToken, refreshToken };
};

export const createUser = async (data: CreateUserDto) => {
  const existingUser = await authRepository.findByEmail(data.email);
  if (existingUser) throw new Error("User with this email already exists");

  const passwordHash = await hashPassword(data.password);
  return authRepository.create({
    ...data,
    passwordHash,
  });
};

export const refresh = async (data: RefreshDto) => {
  let tokenUser: AuthUser;
  try { tokenUser = verifyRefreshToken(data.refreshToken) }
  catch { throw new Error("Invalid refresh token") }

  const tokenHash = hashRefreshToken(data.refreshToken);
  const user = await authRepository.findByRefreshToken(tokenHash);
  if (!user || !user.isActive || user.id.toString() !== tokenUser.sub || tokenUser.principalType !== PrincipalType.USER) throw new Error("Invalid refresh token");

  const authUser = toAuthUser(user);
  const nextRefreshToken = signRefreshToken(authUser);
  const rotated = await authRepository.rotateRefreshToken(user.id, tokenHash, hashRefreshToken(nextRefreshToken));
  if (!rotated) throw new Error("Invalid refresh token");

  return { accessToken: signAccessToken(authUser), refreshToken: nextRefreshToken };
};


export const logout = async (id: string) => {
  await authRepository.removeRefreshToken(parseId(id));
  return { message: "Logged out successfully" };
};

export const refreshing = async(data: RefreshDto) => {
  let tokenUser: AuthUser;

  try {tokenUser = verifyRefreshToken(data.refreshToken)}
  catch {throw new Error("invalid token")}

  const hashedCurrentToken = hashRefreshToken(data.refreshToken)
  const existingUser = await authRepository.findByRefreshToken(hashedCurrentToken);
  if(!existingUser || !existingUser.isActive || parseId(tokenUser.sub) !== existingUser.id || tokenUser.principalType !== PrincipalType.USER) throw new Error("invalid token");

  const authUser = toAuthUser(existingUser);
  const newRefreshToken = signRefreshToken(authUser);
  const newAccessToken = signAccessToken(authUser);
  const hashedNewRefreshToken = hashRefreshToken(newRefreshToken);

  await authRepository.rotateRefreshToken(parseId(authUser.sub), hashedCurrentToken, hashedNewRefreshToken)
  return {newAccessToken, newRefreshToken};

} 


export const changePassword = async (id: string, data: ChangePasswordDto, requesterId: string) => {
  if (id !== requesterId) throw new Error("You can only change your own password");
  const user = await authRepository.findById(parseId(id));
  if (!user) throw new Error("User not found");

  const userWithPassword = await authRepository.findByIdWithPassword(user.id);
  if (!userWithPassword || !(await verifyPassword(data.currentPassword, userWithPassword.passwordHash))) {
    throw new Error("Current password is incorrect");
  }

  const passwordHash = await hashPassword(data.newPassword);
  return authRepository.updatePassword(user.id, passwordHash);
};

export const activateUser = async (id: string) => {
  const user = await authRepository.findById(parseId(id));
  if (!user) throw new Error("User not found");
  return authRepository.activate(user.id);
};

export const deactivateUser = async (id: string) => {
  const user = await authRepository.findById(parseId(id));
  if (!user) throw new Error("User not found");
  return authRepository.deactivate(user.id);
};

export const me = async (id: string) => {
  const user = await authRepository.findById(parseId(id));
  if (!user) throw new Error("User not found");
  return user;
};