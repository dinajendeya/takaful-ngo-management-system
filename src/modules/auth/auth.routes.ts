import { Router } from "express";
import { validate } from "../../common/middlewares/validate.middleware.js";
import * as authController from "./controllers/auth.controller.js";
import { loginSchema, createUserSchema, changePasswordSchema } from "./schemas/auth.schema.js";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.post("/users", validate(createUserSchema), authController.createUser);
router.patch("/users/:publicId/change-password", validate(changePasswordSchema), authController.changePassword);
router.patch("/users/:publicId/activate", authController.activateUser);
router.patch("/users/:publicId/deactivate", authController.deactivateUser);
router.post("/logout", authController.logout);
router.get("/me", validate, authController.me);

export default router;