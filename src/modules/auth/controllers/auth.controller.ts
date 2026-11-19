import type { Request, Response } from "express";
import * as authService from "../services/auth.service.js";
import { serialize } from "../../../common/utils/serializer.js";

type UserParams = { id: string };

export const login = async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  return res.status(200).json({ success: true, data: serialize(result) });
};

export const refresh = async (req: Request, res: Response) => {
  const result = await authService.refresh(req.body);
  return res.status(200).json({ success: true, data: serialize(result) });
};

export const createUser = async (req: Request, res: Response) => {
  const user = await authService.createUser(req.body);
  return res.status(201).json({ success: true, data: serialize(user) });
};

export const changePassword = async (req: Request<UserParams>, res: Response) => {
  const result = await authService.changePassword(req.params.id, req.body, req.user!.id);
  return res.status(200).json({ success: true, data: serialize(result) });
};

export const activateUser = async (req: Request<UserParams>, res: Response) => {
  const user = await authService.activateUser(req.params.id);
  return res.status(200).json({ success: true, data: serialize(user) });
};

export const deactivateUser = async (req: Request<UserParams>, res: Response) => {
  const user = await authService.deactivateUser(req.params.id);
  return res.status(200).json({ success: true, data: serialize(user) });
};

export const me = async (req: Request, res: Response) => {
  const user = await authService.me(req.user!.id);
  return res.status(200).json({ success: true, data: serialize(user) });
};

export const logout = async (req: Request, res: Response) => {
  const result = await authService.logout(req.user!.id);
  return res.status(200).json({ success: true, data: result });
};