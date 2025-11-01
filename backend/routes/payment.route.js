import express from "express";
import {
  createCoupons,
  createPromoCode,
  deleteCoupons,
  getAllCoupons,
  getAllPromoCode,
  togglePromoCode,
} from "../controllers/payment.controller.js";
import { validateInput } from "../utils/validateInput.js";
import {
  createCouponsValidation,
  createPromoCodeValidation,
  togglePromoCodeValidation,
} from "../validators/paymentSchema.js";
import { checkOwnerAndAdmin } from "../middlewares/permission.middleware.js";

const router = express.Router();

router.use(checkOwnerAndAdmin());

// coupon
router
  .route("/coupon")
  .get(getAllCoupons)
  .post(validateInput(createCouponsValidation), createCoupons);

router.route("/coupon/:id").delete(deleteCoupons);

// promo-code
router
  .route("/promo-code")
  .get(getAllPromoCode)
  .post(validateInput(createPromoCodeValidation), createPromoCode);
router
  .route("/promo-code/:id")
  .patch(validateInput(togglePromoCodeValidation), togglePromoCode)
  .delete(deleteCoupons);

export default router;
