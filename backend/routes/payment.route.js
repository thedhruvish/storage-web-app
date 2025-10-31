import express from "express";
import {
  createCoupens,
  createPromoCode,
  deleteCoupens,
  getAllCoupens,
  getAllPromoCode,
  togglePromoCode,
} from "../controllers/payment.controller.js";
import { validateInput } from "../utils/validateInput.js";
import {
  createCoupensValidation,
  createPromoCodeValidation,
  togglePromoCodeValidation,
} from "../validators/paymentSchema.js";
import { checkOwnerAndAdmin } from "../middlewares/permission.middleware.js";

const router = express.Router();

router.use(checkOwnerAndAdmin());

// coupen
router
  .route("/coupen")
  .get(getAllCoupens)
  .post(validateInput(createCoupensValidation), createCoupens);

router.route("/coupen/:id").delete(deleteCoupens);

// promocode
router
  .route("/promocode")
  .get(getAllPromoCode)
  .post(validateInput(createPromoCodeValidation), createPromoCode);
router
  .route("/promocode/:id")
  .put(validateInput(togglePromoCodeValidation), togglePromoCode)
  .delete(deleteCoupens);

export default router;
