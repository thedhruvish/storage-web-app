import { SESSION_OPTIONS } from "../constants/constant.js";
import {
  generateLoginChallenge,
  loginWithTOTP,
  setup2FA,
  verifyLoginPasskey,
  verifyPasskeyRegistration,
  verifyTOTPSetup,
} from "../services/twofa.service.js";
import ApiResponse from "../utils/ApiResponse.js";

export const twoFASetup = async (req, res) => {
  const data = await setup2FA(req.user, req.body.method);
  res.status(201).json(new ApiResponse(201, "2FA setup initiated", data));
};

export const totpRegisterVerify = async (req, res) => {
  const data = await verifyTOTPSetup(req.user, req.body);
  res.status(200).json(new ApiResponse(200, "2FA enabled", data));
};

export const passkeyRegisterVerify = async (req, res) => {
  const data = await verifyPasskeyRegistration(req.user, req.body);
  res.status(201).json(new ApiResponse(201, "Passkey verified", data));
};

export const twoFaLoginTotp = async (req, res) => {
  const session = await loginWithTOTP(req.body);
  res.cookie("sessionId", session.cookie.value, SESSION_OPTIONS);
  res.status(200).json(new ApiResponse(200, "Login success"));
};

export const generatePasskeyChallenge = async (req, res) => {
  const data = await generateLoginChallenge(req.body.userId);
  res.status(200).json(new ApiResponse(200, "Challenge generated", data));
};

export const verifyPasskeyChallenge = async (req, res) => {
  const session = await verifyLoginPasskey(req.body);
  res.cookie("sessionId", session.cookie.value, SESSION_OPTIONS);
  res.status(200).json(new ApiResponse(200, "Login success"));
};
