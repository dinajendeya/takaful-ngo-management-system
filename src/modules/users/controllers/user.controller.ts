import type { createUserDTO } from "../schemas/user.schema.js";
import { UserService } from "../sevices/user.service.js";
import type {Request, Response, NextFunction} from  "express";

export class UserController {
    constructor(private readonly userService = new UserService()){};

    async createUser(req: Request, res:Response){
        const user = this.userService.createUser(req.body);
        return res.status(201).json({success: true, body: user})
    }
}