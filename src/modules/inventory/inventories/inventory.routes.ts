import { Router } from "express";
import * as inventoryController from "./inventory.controller.js";
import { authenticate } from "../../../common/middlewares/authenticate.middleware.js";
import { authorize } from "../../../common/middlewares/authorize.middleware.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

router.use(authenticate);

// Any authenticated user (Admin, Manager, Field Researcher) can call these.
// The Service layer will enforce that Managers only see their own branch.
router.get("/", inventoryController.findAll);
router.get("/:id", inventoryController.findOne);
router.get("/:id/stock", inventoryController.findStock); 

// deactivating restricted to Admin and Managers
router.post("/", authorize(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.INVENTORY_MANAGER), inventoryController.create);
router.patch("/:id", authorize(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.INVENTORY_MANAGER), inventoryController.update);
router.delete("/:id", authorize(UserRole.ADMIN, UserRole.BRANCH_MANAGER), inventoryController.deactivate);

export default router;