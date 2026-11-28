import type { Request, Response, NextFunction } from "express";
import { PrincipalType } from "../types/auth-user.js";
import * as authService from "../../modules/auth/user-auth/auth.service.js";

export const requirePasswordChanged = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.principalType !== PrincipalType.USER) return next();

  const path = req.originalUrl.split("?")[0];
  if ((req.method === "PATCH" && path === "/api/auth/change-password")
    || (req.method === "POST" && path === "/api/auth/logout")) return next();

  const status = await authService.getPasswordChangeStatus(req.user.sub);
  if (!status) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (status.mustChangePassword) {
    return res.status(403).json({ success: false, message: "Change your password before continuing" });
  }
  return next();
};
