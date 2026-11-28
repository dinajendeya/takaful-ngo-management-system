import { randomBytes } from "node:crypto";
import { hashPassword } from "../../../common/utils/password.js";
import { parseId } from "../../../common/utils/parseId.js";
import * as userRepository from "./user.repository.js";
import type { CreateUserDto, UpdateUserDto } from "./user.types.js";

const createTemporaryPassword = () => `${randomBytes(24).toString("base64url")}Aa1!`;

export const getUsers = () => userRepository.findMany();

export const getUserById = async (id: string) => {
  const user = await userRepository.findById(parseId(id));
  if (!user) throw new Error("User not found");
  return user;
};

export const findUserById = async (id: string) =>
  userRepository.findById(parseId(id));

export const createUser = async (data: CreateUserDto) => {
  if (await userRepository.findByEmail(data.email)) throw new Error("User with this email already exists");

  const temporaryPassword = createTemporaryPassword();
  const user = await userRepository.create({
    ...data,
    passwordHash: await hashPassword(temporaryPassword),
  });
  return { ...user, temporaryPassword };
};

export const updateUser = async (id: string, data: UpdateUserDto) => {
  const userId = parseId(id);
  if (!(await userRepository.findById(userId))) throw new Error("User not found");
  if (data.email) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing && existing.id !== userId) throw new Error("User with this email already exists");
  }
  return userRepository.updateProfile(userId, data);
};

export const activateUser = async (id: string) => {
  const userId = parseId(id);
  if (!(await userRepository.findById(userId))) throw new Error("User not found");
  return userRepository.activate(userId);
};

export const deactivateUser = async (id: string) => {
  const userId = parseId(id);
  if (!(await userRepository.findById(userId))) throw new Error("User not found");
  return userRepository.deactivate(userId);
};
