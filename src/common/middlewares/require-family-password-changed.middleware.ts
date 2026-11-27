import type { Request, Response, NextFunction } from "express";
import { PrincipalType } from "../types/auth-user.js";
import * as familyAuthService from "../../modules/family/family-auth/family-auth.service.js";

export const requireFamilyPasswordChanged = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.principalType !== PrincipalType.FAMILY) return next();
  const family = await familyAuthService.getPasswordChangeStatus(req.user.sub);
  if (!family) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (family.mustChangePassword) return res.status(403).json({ success: false, message: "Change your password before continuing" });
  return next();
};
