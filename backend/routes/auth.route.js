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
  loginWithEmailValidation,
  loginWithGoogleValidation,
  registerWithEmailValidation,
  reSendOtpValidation,
  verfiyOtpValidation,
  verifiyToken,
} from "../validators/authSchema.js";
import { validateInput } from "../utils/validateInput.js";
import { getRequestInfo } from "../middlewares/getRequestInfo.js";
import {
  totpRegisterVerify,
  passkeyRegisterVerify,
  twoFASetup,
  twoFaLoginTotp,
  verifyPasskeyChallenge,
  generatePasskeyChallenge,
} from "../controllers/twoFa.controller.js";

const router = express.Router();

// get info on the os,browser etc.
router.use(getRequestInfo);

// router login with email and password
router.post(
  "/register",
  validateInput(registerWithEmailValidation),
  registerWithEmail,
);
router.post("/login", validateInput(loginWithEmailValidation), loginWithEmail);

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

// two fa auth login
router.post("/2fa/login/totp", validateInput(verifiyToken), twoFaLoginTotp);

router.post(
  "/2fa/login/passkey-challenge",
  validateInput(reSendOtpValidation),
  generatePasskeyChallenge,
);

router.post("/2fa/login/passkey-verify", verifyPasskeyChallenge);

// authenticated route
router.use(checkAuth);
router.get("/me", getCureentUser);
// logout user
router.post("/logout", logout);
router.get("/logoutAll", logoutAllDevices);

// setup first time
router.post(
  "/2fa/register/setup",
  validateInput(twoFaRegisterMethod),
  twoFASetup,
);

// totp verfiy to register
router.post(
  "/2fa/register/totp",
  validateInput(verifiyToken),
  totpRegisterVerify,
);

// passkey register verfiy
router.post("/2fa/register/passkeys", passkeyRegisterVerify);

export default router;
