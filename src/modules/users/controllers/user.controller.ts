import { UserService } from "../sevices/user.service.js";
import type { Request, Response } from "express";

export class UserController {
    private readonly userService: UserService;

    constructor(userService = new UserService()) {
        this.userService = userService;
    }

    async createUser(req: Request, res:Response){
        const user = this.userService.createUser(req.body);
        return res.status(201).json({success: true, body: user})
    }
}