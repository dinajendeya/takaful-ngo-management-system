import type { Request, Response } from "express";
import * as donorAuthService from "./donor-auth.service.js";
import { donorRegisterSchema, donorLoginSchema, donorRefreshSchema, donorChangePasswordSchema } from "./donor-auth.schema.js";
import { serialize } from "../../../common/utils/serializer.js";

export const register = async (req: Request, res: Response) => {
  const data = donorRegisterSchema.parse(req.body);
  const tokens = await donorAuthService.register(data);
  return res.status(201).json({ success: true, data: tokens });
};

export const login = async (req: Request, res: Response) => {
  const data = donorLoginSchema.parse(req.body);
  const tokens = await donorAuthService.login(data);
  return res.status(200).json({ success: true, data: tokens });
};

export const refresh = async (req: Request, res: Response) => {
  const data = donorRefreshSchema.parse(req.body);
  const tokens = await donorAuthService.refresh(data.refreshToken);
  return res.status(200).json({ success: true, data: tokens });
};

export const logout = async (req: Request, res: Response) => {
  const result = await donorAuthService.logout((req as any).user.sub);
  return res.status(200).json({ success: true, data: result });
};

export const me = async (req: Request, res: Response) => {
  const donor = await donorAuthService.me((req as any).user.sub);
  return res.status(200).json({ success: true, data: serialize(donor) });
};

export const changePassword = async (req: Request, res: Response) => {
  const data = donorChangePasswordSchema.parse(req.body);
  const result = await donorAuthService.changePassword(
    (req as any).user.sub,
    data.currentPassword,
    data.newPassword
  );
  return res.status(200).json({ success: true, data: result });
};