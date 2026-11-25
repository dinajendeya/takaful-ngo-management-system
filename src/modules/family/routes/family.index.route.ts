import { Router } from "express";
import familyAuthRoutes from "./family-auth.route.js";
import familyRoutes from "./family.route.js";
import familyRequestRoutes from "./family-request.route.js";

const router = Router();

router.use("/family-auth", familyAuthRoutes);
router.use("/families", familyRoutes);
router.use("/family-requests", familyRequestRoutes);

export default router;