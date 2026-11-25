import type { Request, Response, NextFunction } from "express";
import { UserRole } from "../../generated/prisma/enums.js";
import { PrincipalType } from "../types/auth-user.js";

export const authorize = (...roles: UserRole[]) =>
    (req: Request, res: Response, next: NextFunction) =>
        !req.user || req.user.principalType !== PrincipalType.USER || !req.user.role || !roles.includes(req.user.role)
            ? res.status(403).json({ success: false, message: "Forbidden" })
            : next();

export const authorizePrincipal = (...types: PrincipalType[]) =>
    (req: Request, res: Response, next: NextFunction) =>
        !req.user || !types.includes(req.user.principalType)
            ? res.status(403).json({ success: false, message: "Forbidden" })
            : next();
