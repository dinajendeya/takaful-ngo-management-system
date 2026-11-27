import * as donorAuthRepository from "./donor-auth.repository.js";
import { hashRefreshToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../../../common/utils/jwt.js";
import { hashPassword, verifyPassword } from "../../../common/utils/password.js";
import { PrincipalType, type AuthUser } from "../../../common/types/auth-user.js";
import { parseId } from "../../../common/utils/parseId.js";
import type { DonorLoginDto, DonorRegisterDto } from "./donor-auth.type.js";

const authUser = (id: bigint): AuthUser => ({ sub: id.toString(), principalType: PrincipalType.DONOR });

export const register = async (data: DonorRegisterDto) => {
  const existing = await donorAuthRepository.findByEmail(data.email);
  if (existing) throw new Error("Email already registered");

  const passwordHash = await hashPassword(data.password);
  const donor = await donorAuthRepository.create({ ...data, passwordHash });

  const user = authUser(donor.id);
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await donorAuthRepository.updateAuth(donor.id, { refreshToken: hashRefreshToken(refreshToken) });

  return { accessToken, refreshToken };
};

export const login = async (data: DonorLoginDto) => {
  const donor = await donorAuthRepository.findByEmail(data.email);
  if (!donor || !(await verifyPassword(data.password, donor.passwordHash))) {
    throw new Error("Invalid email or password");
  }

  const user = authUser(donor.id);
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await donorAuthRepository.updateAuth(donor.id, { refreshToken: hashRefreshToken(refreshToken) });

  return { accessToken, refreshToken };
};

export const refresh = async (token: string) => {
  let tokenUser: AuthUser;
  try { tokenUser = verifyRefreshToken(token); } 
  catch { throw new Error("Invalid refresh token"); }

  if (tokenUser.principalType !== PrincipalType.DONOR) throw new Error("Invalid refresh token");

  const currentHash = hashRefreshToken(token);
  const donor = await donorAuthRepository.findByRefreshToken(currentHash);
  if (!donor || donor.id !== parseId(tokenUser.sub)) throw new Error("Invalid refresh token");

  const nextToken = signRefreshToken(authUser(donor.id));
  const rotated = await donorAuthRepository.rotateRefreshToken(donor.id, currentHash, hashRefreshToken(nextToken));
  if (rotated.count !== 1) throw new Error("Invalid refresh token");

  return { accessToken: signAccessToken(authUser(donor.id)), refreshToken: nextToken };
};

export const logout = async (id: string) => {
  await donorAuthRepository.updateAuth(parseId(id), { refreshToken: null });
  return { message: "Logged out successfully" };
};

export const me = async (id: string) => {
  const donor = await donorAuthRepository.findById(parseId(id));
  if (!donor) throw new Error("Donor not found");

  const { passwordHash: _passwordHash, refreshToken: _refreshToken, ...safeDonor } = donor;
  return safeDonor;
};

export const changePassword = async (id: string, currentPassword: string, newPassword: string) => {
  const donor = await donorAuthRepository.findById(parseId(id));
  if (!donor) throw new Error("Donor not found");
  if (!(await verifyPassword(currentPassword, donor.passwordHash))) throw new Error("Current password is incorrect");

  await donorAuthRepository.updateAuth(donor.id, { passwordHash: await hashPassword(newPassword) });
  return { message: "Password changed successfully" };
};