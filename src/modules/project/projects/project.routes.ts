import { Router } from "express";
import * as projectController from "./project.controller.js";
import { authorize } from "../../../common/middlewares/authorize.middleware.js"; 
import { authenticate } from "../../../common/middlewares/authenticate.middleware.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

router.use(authenticate);

// Anyone authenticated can view projects
router.get("/", projectController.findAll);
router.get("/:id", projectController.findOne);

// Only Admins and Branch Managers can create/edit
router.post("/", authorize(UserRole.ADMIN, UserRole.BRANCH_MANAGER), projectController.create);
router.patch("/:id", authorize(UserRole.ADMIN, UserRole.BRANCH_MANAGER), projectController.update);

export default router;