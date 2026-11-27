import { Router } from "express";
import familyAuthRoutes from "./family-auth/family-auth.routes.js";
import familyRoutes from "./family/family.routes.js";
import familyRequestRoutes from "./family-requests/family-request.routes.js";

const router = Router();

router.use("/family-auth", familyAuthRoutes);
router.use("/families", familyRoutes);
router.use("/family-requests", familyRequestRoutes);

export default router;