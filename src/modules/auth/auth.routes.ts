import { Router } from "express";
import { authenticate } from "../../common/middlewares/authenticate.middleware.js";
import { authorize } from "../../common/middlewares/authorize.middleware.js";
import { validate } from "../../common/middlewares/validate.middleware.js";
import * as authController from "./controllers/auth.controller.js";
import { UserRole } from "../../generated/prisma/enums.js";
import { loginSchema, refreshSchema, logoutSchema, userIdParamsSchema, createUserSchema, changePasswordSchema } from "./schemas/auth.schema.js";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", authenticate, validate(logoutSchema), authController.logout);
router.get("/me", authenticate, authController.me);
router.post("/users", authenticate, authorize(UserRole.ADMIN), validate(createUserSchema), authController.createUser);
router.patch("/users/:id/password", authenticate, validate(userIdParamsSchema, "params"), validate(changePasswordSchema), authController.changePassword);
router.patch("/users/:id/activate", authenticate, authorize(UserRole.ADMIN), validate(userIdParamsSchema, "params"), authController.activateUser);
router.patch("/users/:id/deactivate", authenticate, authorize(UserRole.ADMIN), validate(userIdParamsSchema, "params"), authController.deactivateUser);

export default router;