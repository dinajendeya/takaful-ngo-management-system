import { Router } from "express";
import * as distributionController from "./distribution.controller.js";
import { authorize } from "../../../common/middlewares/authorize.middleware.js"; 
import { authenticate } from "../../../common/middlewares/authenticate.middleware.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

router.use(authenticate);

// Admin sees all, Branch Manager/Distributor sees only their branch (handled in service)
router.get("/", authorize(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.DISTRIBUTOR), distributionController.findAll);
router.get("/:id", authorize(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.DISTRIBUTOR), distributionController.findOne);

// Only these roles can execute a distribution
router.post("/", authorize(UserRole.ADMIN, UserRole.BRANCH_MANAGER, UserRole.DISTRIBUTOR), 
  distributionController.create
);

export default router;