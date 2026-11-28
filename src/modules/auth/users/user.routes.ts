import { Router } from "express";
import { authenticate } from "../../../common/middlewares/authenticate.middleware.js";
import { authorize } from "../../../common/middlewares/authorize.middleware.js";
import { validate } from "../../../common/middlewares/validate.middleware.js";
import { UserRole } from "../../../generated/prisma/enums.js";
import * as userController from "./user.controller.js";
import { createUserSchema, updateUserSchema, userIdParamsSchema } from "./user.schema.js";

const router = Router();
const requireAdmin = [authenticate, authorize(UserRole.ADMIN)] as const;

router.get("/", ...requireAdmin, userController.list);
router.get("/:id", ...requireAdmin, validate(userIdParamsSchema, "params"), userController.get);
router.post("/", ...requireAdmin, validate(createUserSchema), userController.create);
router.patch("/:id", ...requireAdmin, validate(userIdParamsSchema, "params"), validate(updateUserSchema), userController.update);
router.patch("/:id/activate", ...requireAdmin, validate(userIdParamsSchema, "params"), userController.activate);
router.patch("/:id/deactivate", ...requireAdmin, validate(userIdParamsSchema, "params"), userController.deactivate);

export default router;
