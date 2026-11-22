import type { Request, Response, NextFunction } from "express";
import { UserRole } from "../../generated/prisma/enums.js";

export const authorize = (...roles: UserRole[]) =>
    (req: Request, res: Response, next: NextFunction) =>
        !req.user || !req.user.role || !roles.includes(req.user.role)
            ? res.status(403).json({ success: false, message: "Forbidden" })
            : next();
