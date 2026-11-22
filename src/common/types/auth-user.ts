import { UserRole } from "../../generated/prisma/enums.js";

export enum PrincipalType {
  USER = "USER",
  DONOR = "DONOR",
  FAMILY_MEMBER = "FAMILY_MEMBER",
}

export interface AuthUser {
  id: string;
  email: string;
  type: PrincipalType;
  role?: UserRole;
  branchId?: string | null;
}