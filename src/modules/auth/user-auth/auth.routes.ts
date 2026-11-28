import { Router } from "express";
import { PrincipalType } from "../../../common/types/auth-user.js";
import { authenticate } from "../../../common/middlewares/authenticate.middleware.js";
import { authorizePrincipal } from "../../../common/middlewares/authorize.middleware.js";
import { validate } from "../../../common/middlewares/validate.middleware.js";
import * as authController from "./auth.controller.js";
import { changePasswordSchema, loginSchema, logoutSchema, refreshSchema } from "./auth.schema.js";

const router = Router();
const requireUserPrincipal = authorizePrincipal(PrincipalType.USER);

router.post("/login", validate(loginSchema), authController.login);
router.post("/refresh", validate(refreshSchema), authController.refresh);
router.post("/logout", authenticate, requireUserPrincipal, validate(logoutSchema), authController.logout);
router.get("/me", authenticate, requireUserPrincipal, authController.me);
router.patch("/change-password", authenticate, requireUserPrincipal, validate(changePasswordSchema), authController.changePassword);

export default router;
