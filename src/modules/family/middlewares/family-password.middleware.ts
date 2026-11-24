import type { Request, Response, NextFunction } from "express";
import { PrincipalType } from "../../../common/types/auth-user.js";
import { parseId } from "../../../common/utils/parseId.js";
import * as familyRepository from "../repositories/family.repository.js";

export const requireFamilyPasswordChanged = async (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.principalType !== PrincipalType.FAMILY) return next();
  const family = await familyRepository.findFamilyPasswordStatus(parseId(req.user.sub));
  if (!family) return res.status(401).json({ success: false, message: "Unauthorized" });
  if (family.mustChangePassword) return res.status(403).json({ success: false, message: "Change your password before continuing" });
  return next();
};
