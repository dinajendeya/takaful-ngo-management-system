import { UserRole } from "../../generated/prisma/enums.js";

export enum PrincipalType {
  USER = "USER",
  FAMILY = "FAMILY",
}

export interface AuthUser {
  sub: string;
  principalType: PrincipalType;
  role?: UserRole;
  branchId?: string | null;
}