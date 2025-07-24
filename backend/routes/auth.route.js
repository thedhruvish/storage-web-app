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

const router = express.Router();

// router login with email and password
router.post("/register", registerWithEmail);
router.post("/login", loginWithEmail);

// send otp verify
router.post("/otp-verify", verfiyOtp);

// Re-send otp
router.post("/resend-otp", reSendOtp);

// google auth
router.post("/google", loginWithGoogle);

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
