import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;
  const token = authorization?.match(/^Bearer\s+(\S+)$/i)?.[1];

  if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch { return res.status(401).json({ success: false, message: "Invalid token" }) }
};
