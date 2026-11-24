import { Router } from "express";
import { authenticate } from "../../../common/middlewares/authenticate.middleware.js";
import { requireFamilyPasswordChanged } from "../middlewares/family-password.middleware.js";
import { validate } from "../../../common/middlewares/validate.middleware.js";
import { idSchema } from "../../../common/schemas/common.schema.js";
import { z } from "zod";
import * as controller from "../controllers/family-assessment.controller.js";
import { createAssessmentSchema, updateAssessmentSchema } from "../schemas/family.schema.js";

const router = Router({ mergeParams: true });
const paramsSchema = z.object({ familyId: idSchema });
router.post("/", authenticate, requireFamilyPasswordChanged, validate(paramsSchema, "params"), validate(createAssessmentSchema), controller.create);
router.get("/", authenticate, requireFamilyPasswordChanged, validate(paramsSchema, "params"), controller.get);
router.patch("/", authenticate, requireFamilyPasswordChanged, validate(paramsSchema, "params"), validate(updateAssessmentSchema), controller.update);
export default router;
