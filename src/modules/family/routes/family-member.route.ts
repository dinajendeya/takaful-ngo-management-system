import { Router } from "express";
import { authenticate } from "../../../common/middlewares/authenticate.middleware.js";
import { requireFamilyPasswordChanged } from "../middlewares/family-password.middleware.js";
import { validate } from "../../../common/middlewares/validate.middleware.js";
import { idSchema } from "../../../common/schemas/common.schema.js";
import { paginationSchema } from "../../../common/schemas/pagination.schema.js";
import { z } from "zod";
import * as controller from "../controllers/family-member.controller.js";
import { createFamilyMemberSchema, updateFamilyMemberSchema } from "../schemas/family-member.schema.js";

const router = Router({ mergeParams: true });
const paramsSchema = z.object({ familyId: idSchema });
const memberParamsSchema = paramsSchema.extend({ memberId: idSchema });
router.post("/", authenticate, requireFamilyPasswordChanged, validate(paramsSchema, "params"), validate(createFamilyMemberSchema), controller.create);
router.get("/", authenticate, requireFamilyPasswordChanged, validate(paramsSchema, "params"), validate(paginationSchema, "query"), controller.list);
router.get("/:memberId", authenticate, requireFamilyPasswordChanged, validate(memberParamsSchema, "params"), controller.get);
router.patch("/:memberId", authenticate, requireFamilyPasswordChanged, validate(memberParamsSchema, "params"), validate(updateFamilyMemberSchema), controller.update);
router.delete("/:memberId", authenticate, requireFamilyPasswordChanged, validate(memberParamsSchema, "params"), controller.remove);
export default router;
