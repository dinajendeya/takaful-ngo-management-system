import type { Request, Response } from "express";
import { serialize } from "../../../common/utils/serializer.js";
import * as userService from "./user.service.js";

type UserParams = { id: string };

export const list = async (_req: Request, res: Response) =>
  res.status(200).json({ success: true, data: serialize(await userService.getUsers()) });

export const get = async (req: Request<UserParams>, res: Response) =>
  res.status(200).json({ success: true, data: serialize(await userService.getUserById(req.params.id)) });

export const create = async (req: Request, res: Response) =>
  res.status(201).json({ success: true, data: serialize(await userService.createUser(req.body)) });

export const update = async (req: Request<UserParams>, res: Response) =>
  res.status(200).json({ success: true, data: serialize(await userService.updateUser(req.params.id, req.body)) });

export const activate = async (req: Request<UserParams>, res: Response) =>
  res.status(200).json({ success: true, data: serialize(await userService.activateUser(req.params.id)) });

export const deactivate = async (req: Request<UserParams>, res: Response) =>
  res.status(200).json({ success: true, data: serialize(await userService.deactivateUser(req.params.id)) });
