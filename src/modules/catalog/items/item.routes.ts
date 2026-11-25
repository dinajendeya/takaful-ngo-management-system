import { Router } from "express";
import * as itemController from "./item.controller.js";
import { authenticate } from "../../../common/middlewares/authenticate.middleware.js";
import { authorize } from "../../../common/middlewares/authorize.middleware.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

router.use(authenticate);

router.get("/", itemController.findAll);
router.get("/:id", itemController.findOne);
router.post("/", authorize(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.INVENTORY_MANAGER), itemController.create);
router.patch("/:id", authorize(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.INVENTORY_MANAGER), itemController.update);
router.delete("/:id", authorize(UserRole.ADMIN), itemController.remove);
router.patch("/:id/restore", authorize(UserRole.ADMIN), itemController.restore);

export default router;