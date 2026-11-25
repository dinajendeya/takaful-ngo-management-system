import { Router } from "express";
import { validate } from "../../common/middlewares/validate.middleware.js";
import * as branchController from "./controllers/branch.controller.js";
import { branchIdParamsSchema, createBranchSchema, updateBranchSchema } from "./schemas/branch.schema.js";

const router = Router();

router.post("/", validate(createBranchSchema), branchController.create);
router.get("/", branchController.findAll);
router.get("/:id", validate(branchIdParamsSchema, "params"), branchController.findOne);
router.patch("/:id", validate(branchIdParamsSchema, "params"), validate(updateBranchSchema), branchController.update);
router.patch("/:id/activate", validate(branchIdParamsSchema, "params"), branchController.activate);
router.patch("/:id/deactivate", validate(branchIdParamsSchema, "params"), branchController.deactivate);

export default router;