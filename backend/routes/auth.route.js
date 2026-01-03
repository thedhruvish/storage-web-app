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
  connectWithGithub,
  connectWithEmail,
  connectWithGoogle,
  connectWithEmailVerifyOtp,
  emailAccountVerifyByOtp,
  connectAccountWithEmail,
  connectAccountWithGoogle,
  disConnectAccount,
} from "../controllers/auth.controller.js";
import { checkAuth } from "../middlewares/auth.middleware.js";
import {
  emailAndPWDValidation,
  loginValidation,
  loginWithEmailValidation,
  loginWithGoogleValidation,
  registerTOTPToken,
  registerWithEmailValidation,
  reSendOtpValidation,
  twoFaRegisterMethod,
  verfiyOtpValidation,
  verifyConnectEmail,
} from "../validators/auth.validator.js";
import { validateInput } from "../utils/validateInput.js";
import { getRequestInfo } from "../middlewares/getRequestInfo.middleware.js";
import {
  totpRegisterVerify,
  passkeyRegisterVerify,
  twoFASetup,
  twoFaLoginTotp,
  verifyPasskeyChallenge,
  generatePasskeyChallenge,
} from "../controllers/twoFa.controller.js";
import paramsValidation from "../middlewares/paramsValidation.middleware.js";

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
router.post("/github", loginWithGithub);
router.get("/github/callback", callbackGithub);
// link account
router.get("/github/link", connectWithGithub);

// two fa auth login
router.post("/2fa/login/totp", validateInput(loginValidation), twoFaLoginTotp);

router.post(
  "/2fa/login/passkey-challenge",
  validateInput(reSendOtpValidation),
  generatePasskeyChallenge,
);

router.post("/2fa/login/passkey-verify", verifyPasskeyChallenge);

// authenticated route
router.use(checkAuth);
router.get("/me", getCureentUser);

// link account
router.post("/google/link", connectWithGoogle);
router.post("/email/link", connectWithEmail);
router.post("/email/link-verify", connectWithEmailVerifyOtp);

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
  validateInput(registerTOTPToken),
  totpRegisterVerify,
);

// passkey register verfiy
router.post("/2fa/register/passkeys", passkeyRegisterVerify);

/**
 * link account
 */

router.post(
  "/link/google",
  validateInput(loginWithGoogleValidation),
  connectAccountWithGoogle,
);

router.post(
  "/link/email",
  validateInput(emailAndPWDValidation),
  connectAccountWithEmail,
);
router.post(
  "/link/email/verify-otp",
  validateInput(verifyConnectEmail),
  emailAccountVerifyByOtp,
);
//  valid parms
router.param("id", paramsValidation);

router.delete("/unlink/:id", disConnectAccount);
export default router;
