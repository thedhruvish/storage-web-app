import express from "express";
import {
  getAllPlans,
  createPlan,
  deletePlan,
  togglePlan,
  getAllPlansForPublic,
} from "../controllers/plan.controller.js";
import paramsValidation from "../middlewares/paramsValidation.js";
import { validateInput } from "../utils/validateInput.js";
import { planCreateValidation } from "../validators/planSchema.js";
import { checkOwnerAndAdmin } from "../middlewares/permission.middleware.js";
import { checkAuth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/pricing", getAllPlansForPublic);

router.use(checkAuth, checkOwnerAndAdmin());

router
  .route("/")
  .get(getAllPlans)
  .post(validateInput(planCreateValidation), createPlan);

// verify is valid mongo id
router.param("id", paramsValidation);

router.route("/:id").put(togglePlan).delete(deletePlan);

export default router;
