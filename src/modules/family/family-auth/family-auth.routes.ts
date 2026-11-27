import { Router } from "express";
import { PrincipalType } from "../../../common/types/auth-user.js";
import { authenticate } from "../../../common/middlewares/authenticate.middleware.js";
import { authorizePrincipal } from "../../../common/middlewares/authorize.middleware.js";
import { validate } from "../../../common/middlewares/validate.middleware.js";
import * as controller from "./family-auth.controller.js";
import { familyLoginSchema, familyPasswordSchema, familyRefreshSchema } from "./family-auth.schema.js";

const router = Router();
router.post("/login", validate(familyLoginSchema), controller.login);
router.post("/refresh", validate(familyRefreshSchema), controller.refresh);
router.get("/me", authenticate, authorizePrincipal(PrincipalType.FAMILY), controller.me);
router.post("/logout", authenticate, authorizePrincipal(PrincipalType.FAMILY), controller.logout);
router.patch("/password", authenticate, authorizePrincipal(PrincipalType.FAMILY), validate(familyPasswordSchema), controller.changePassword);
export default router;
