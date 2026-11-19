import { createHash } from "node:crypto";
import jwt from "jsonwebtoken";
import { UserRole } from "../../generated/prisma/enums.js";
import { PrincipalType, type AuthUser } from "../types/auth-user.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is missing");

const signToken = (user: AuthUser, audience: "access" | "refresh", expiresIn: "15m" | "7d") =>
  jwt.sign(user, JWT_SECRET, { algorithm: "HS256", audience, expiresIn });

export const verifyToken = (token: string, audience: "access" | "refresh"): AuthUser =>
  jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"], audience }) as AuthUser;

export const signAccessToken = (user: AuthUser): string => signToken(user, "access", "15m");
export const verifyAccessToken = (token: string): AuthUser => verifyToken(token, "access");
export const signRefreshToken = (user: AuthUser): string => signToken(user, "refresh", "7d");
export const verifyRefreshToken = (token: string): AuthUser => verifyToken(token, "refresh");
export const hashRefreshToken = (token: string): string => createHash("sha256").update(token).digest("hex");