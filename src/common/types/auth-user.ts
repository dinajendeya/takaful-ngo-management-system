import { UserRole } from "../../generated/prisma/enums.js";

export enum PrincipalType {
  USER = "USER",
  FAMILY = "FAMILY",
  DONOR = "DONOR"
}

export interface AuthUser {
  sub: string;
  principalType: PrincipalType;
  role?: UserRole;
  branchId?: string | null;
  mustChangePassword?: boolean;
}