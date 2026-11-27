import { Router } from "express";
import * as donorAuthController from "./donor-auth.controller.js";
import { authenticate } from "../../../common/middlewares/authenticate.middleware.js";

const router = Router();

// Public routes
router.post("/register", donorAuthController.register);
router.post("/login", donorAuthController.login);
router.post("/refresh", donorAuthController.refresh);

// Protected routes (require DONOR token)
router.use(authenticate);
router.post("/logout", donorAuthController.logout);
router.get("/me", donorAuthController.me);
router.patch("/change-password", donorAuthController.changePassword);

export default router;