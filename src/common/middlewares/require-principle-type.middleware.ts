import type { Request, Response, NextFunction } from "express";
import { PrincipalType } from "../../common/types/auth-user.js";

export const requirePrincipal = (type: PrincipalType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user?.principalType !== type) {
      return res.status(403).json({ success: false, message: "Forbidden: Invalid token type" });
    }
    next();
  };
};