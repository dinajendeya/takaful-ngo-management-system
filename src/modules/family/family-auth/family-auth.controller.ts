import type { Request, Response } from "express";
import { serialize } from "../../../common/utils/serializer.js";
import * as familyAuthService from "./family-auth.service.js";

export const login = async (req: Request, res: Response) => res.status(200).json({ success: true, data: serialize(await familyAuthService.login(req.body)) });
export const refresh = async (req: Request, res: Response) => res.status(200).json({ success: true, data: serialize(await familyAuthService.refresh(req.body.refreshToken)) });
export const me = async (req: Request, res: Response) => res.status(200).json({ success: true, data: serialize(await familyAuthService.me(req.user!.sub)) });
export const logout = async (req: Request, res: Response) => res.status(200).json({ success: true, data: await familyAuthService.logout(req.user!.sub) });
export const changePassword = async (req: Request, res: Response) => res.status(200).json({ success: true, data: await familyAuthService.changePassword(req.user!.sub, req.body.currentPassword, req.body.newPassword) });
