import express from "express";
import {
  createCoupons,
  createPromoCode,
  deleteCoupons,
  genratorRazorpayCheckout,
  genratorStripeCheckoutUrl,
  getAllCoupons,
  getAllPromoCode,
  togglePromoCode,
  verifyRazorpayPayment,
} from "../controllers/billing.controller.js";
import { validateInput } from "../utils/validateInput.js";
import {
  billingValidation,
  createCouponsValidation,
  createPromoCodeValidation,
  togglePromoCodeValidation,
} from "../validators/payment.validator.js";
import { checkOwnerAndAdmin } from "../middlewares/permission.middleware.js";

const router = express.Router();

//  only auth access
router.post(
  "/stripe-checkout",
  validateInput(billingValidation),
  genratorStripeCheckoutUrl,
);

router.post(
  "/razorpay-checkout",
  validateInput(billingValidation),
  genratorRazorpayCheckout,
);

router.post("/razorpay-verify", verifyRazorpayPayment);

// admin access those routes
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
  .patch(validateInput(togglePromoCodeValidation), togglePromoCode);

export default router;
