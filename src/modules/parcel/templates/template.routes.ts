import { Router } from "express";
import * as templateController from "./template.controller.js";
import { authorize } from "../../../common/middlewares/authorize.middleware.js"; 
import { authenticate } from "../../../common/middlewares/authenticate.middleware.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

router.use(authenticate);

router.get("/", templateController.findAll);
router.get("/:id", templateController.findOne);
router.post("/", authorize(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.INVENTORY_MANAGER), templateController.create);
router.patch("/:id", authorize(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.INVENTORY_MANAGER), templateController.update);
router.delete("/:id", authorize(UserRole.ADMIN), templateController.archive);

export default router;