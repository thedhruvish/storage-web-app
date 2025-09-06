import express from "express";
import {
  registerWithEmail,
  loginWithEmail,
  logout,
  logoutAllDevices,
  getCureentUser,
  loginWithGoogle,
  loginWithGithub,
  callbackGithub,
  verfiyOtp,
  reSendOtp,
} from "../controllers/auth.controller.js";
import { checkAuth } from "../middlewares/auth.js";
import {
  loginWithGoogleValidation,
  registerWithEmailValidation,
  reSendOtpValidation,
  verfiyOtpValidation,
} from "../validators/authSchema.js";
import { validateInput } from "../utils/validateInput.js";

const router = express.Router();

// router login with email and password
router.post(
  "/register",
  validateInput(registerWithEmailValidation),
  registerWithEmail,
);
router.post(
  "/login",
  validateInput(registerWithEmailValidation),
  loginWithEmail,
);

// send otp verify
router.post("/otp-verify", validateInput(verfiyOtpValidation), verfiyOtp);

// Re-send otp
router.post("/resend-otp", validateInput(reSendOtpValidation), reSendOtp);

// google auth
router.post(
  "/google",
  validateInput(loginWithGoogleValidation),
  loginWithGoogle,
);

// github login
router.get("/github", loginWithGithub);
router.get("/github/callback", callbackGithub);

// authenticated route
router.use(checkAuth);
router.get("/me", getCureentUser);

// logout user
router.post("/logout", logout);
router.get("/logoutAll", logoutAllDevices);
export default router;
