import { Router } from "express";
import * as donorController from "./donor.controller.js";
import { authenticate } from "../../../common/middlewares/authenticate.middleware.js";
import { authorize } from "../../../common/middlewares/authorize.middleware.js";
import { requirePrincipal } from "../../../common/middlewares/auth.middleware.js"; // Assuming you added the principal check
import { UserRole } from "../../../generated/prisma/enums.js";
import { PrincipalType } from "../../../common/types/auth-user.js";

const router = Router();

router.use(authenticate);

// ── Donor Portal Routes (DONOR principal only) ───────────────────
router.get("/me", requirePrincipal(PrincipalType.DONOR), donorController.getMyProfile);
router.patch("/me", requirePrincipal(PrincipalType.DONOR), donorController.updateMyProfile);

// ── Admin Routes (USER principal with specific roles) ────────────
// Middleware stack: ensure it's an internal USER, AND they have the right role
router.get("/", authorize(UserRole.ADMIN, UserRole.FINANCE_MANAGER), donorController.listAllDonors);
router.get("/:id", authorize(UserRole.ADMIN, UserRole.FINANCE_MANAGER), donorController.getDonorById);

// Only Admins and Finance Managers can create or update a donor's CRM info
router.post("/", authorize(UserRole.ADMIN, UserRole.FINANCE_MANAGER), donorController.adminCreateDonor);
router.patch("/:id", authorize(UserRole.ADMIN, UserRole.FINANCE_MANAGER), donorController.adminUpdateDonor);

export default router;