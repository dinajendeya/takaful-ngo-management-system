import * as authRepository from "../repositories/auth.repository.js";
import { signAccessToken } from "../../../common/utils/jwt.js";
import { hashPassword, verifyPassword } from "../../../common/utils/password.js";
import { PrincipalType } from "../../../common/types/auth-user.js";
import type { LoginDto, CreateUserDto, ChangePasswordDto } from "../schemas/auth.schema.js";

export const login = async (data: LoginDto) => {
  const user = await authRepository.findByEmail(data.email);
  if (!user) throw new Error("Invalid email or password");
  if (!user.isActive) throw new Error("Account is deactivated");

  const isPasswordValid = await verifyPassword(data.password, user.passwordHash);
  if (!isPasswordValid) throw new Error("Invalid email or password");
  
  await authRepository.updateLastLogin(user.id);

  const accessToken = signAccessToken({
    id: user.id.toString(),
    publicId: user.publicId,
    email: user.email,
    role: user.role,
    type: PrincipalType.USER,
    branchId: user.branchId?.toString() ?? null,
  });
  return { user, accessToken };
};

export const createUser = async (data: CreateUserDto) => {
  const existingUser = await authRepository.findByEmail(data.email);
  if (existingUser) throw new Error("User with this email already exists");

  const passwordHash = await hashPassword(data.password);
  return authRepository.create({
    ...data,
    passwordHash,
    publicId: `USR-${Date.now()}`,
  });
};

export const changePassword = async (publicId: string, data: ChangePasswordDto) => {
  const user = await authRepository.findByPublicId(publicId);
  if (!user) throw new Error("User not found");

  const isPasswordValid = await verifyPassword(data.currentPassword, user.passwordHash);
  if (!isPasswordValid) throw new Error("Current password is incorrect");

  const passwordHash = await hashPassword(data.newPassword);
  return authRepository.updatePassword(publicId, passwordHash);
};

export const activateUser = async (publicId: string) => {
  const user = await authRepository.findByPublicId(publicId);
  if (!user) throw new Error("User not found");
  return authRepository.activate(publicId);
};

export const deactivateUser = async (publicId: string) => {
  const user = await authRepository.findByPublicId(publicId);
  if (!user) throw new Error("User not found");
  return authRepository.deactivate(publicId);
};

export const me = async (publicId: string) => {
  const user = await authRepository.findByPublicId(publicId);
  if (!user) throw new Error("User not found");
  return user;
};

export const logout = async () => {message: "Logged out successfully"};