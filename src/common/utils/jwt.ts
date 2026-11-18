import jwt from "jsonwebtoken";
import { type AuthUser } from "../types/auth-user.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) throw new Error("JWT_SECRET is missing");

export const signAccessToken = (user: AuthUser): string => jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      type: user.type,
      branchId: user.branchId,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, JWT_SECRET);