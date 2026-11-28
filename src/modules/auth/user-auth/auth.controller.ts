import type { Request, Response } from "express";
import { serialize } from "../../../common/utils/serializer.js";
import * as authService from "./auth.service.js";
import * as userService from "../users/user.service.js";

export const login = async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  return res.status(200).json({ success: true, data: serialize(result) });
};

export const refresh = async (req: Request, res: Response) => {
  const result = await authService.refresh(req.body);
  return res.status(200).json({ success: true, data: serialize(result) });
};

export const changePassword = async (req: Request, res: Response) => {
  const result = await authService.changePassword(req.user!.sub, req.body);
  return res.status(200).json({ success: true, data: serialize(result) });
};

export const me = async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.user!.sub);
  return res.status(200).json({ success: true, data: serialize(user) });
};

export const logout = async (req: Request, res: Response) => {
  const result = await authService.logout(req.user!.sub);
  return res.status(200).json({ success: true, data: result });
};
