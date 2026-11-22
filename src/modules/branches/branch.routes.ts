import { Router } from "express";
import { validate } from "../../common/middlewares/validate.middleware.js";
import { branchController } from "./controllers/branch.controller.js";
import { createBranchSchema, updateBranchSchema, } from "./schemas/branch.schema.js";

const router = Router();

router.post("/", validate(createBranchSchema), branchController.create);
router.get("/", branchController.findAll);
router.get("/:publicId", branchController.findOne);
router.patch("/:publicId", validate(updateBranchSchema), branchController.update);
router.patch("/:publicId/activate", branchController.activate);
router.patch("/:publicId/deactivate", branchController.deactivate);

export default router;