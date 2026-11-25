import { Router } from "express";
import * as categoryController from "./category.controller.js";
import { authenticate } from "../../../common/middlewares/authenticate.middleware.js";
import { authorize } from "../../../common/middlewares/authorize.middleware.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

router.use(authenticate);

router.get("/", categoryController.findAll);
router.get("/:id", categoryController.findOne);

// Mutations restricted to Admins/Managers
router.post("/", authorize(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.INVENTORY_MANAGER), categoryController.create);
router.get("/", authorize(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.INVENTORY_MANAGER), categoryController.findAll);
router.get("/:id", authorize(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.INVENTORY_MANAGER), categoryController.findOne);
router.patch("/:id", authorize(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.INVENTORY_MANAGER), categoryController.update);
router.delete("/:id", authorize(UserRole.ADMIN), categoryController.remove); // Stricter for delete

export default router;