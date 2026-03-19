import { z } from "zod";

export const emailAndPWDValidation = z.object({
  email: z.email("Invalid email address").trim().toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  deviceName: z.string().optional(),
  ip: z.string().optional(),
});

export const loginWithEmailValidation = emailAndPWDValidation.extend({
  turnstileToken: z.string().optional(),
});

export const verifyConnectEmail = emailAndPWDValidation.extend({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

export const registerWithEmailValidation = loginWithEmailValidation.extend({
  name: z.string().min(3, "Name must be at least 3 characters long"),
});

export const loginWithGoogleValidation = z.object({
  idToken: z.string().min(3, "Missing Information try agin."),
});

export const verfiyOtpValidation = z.object({
  otp: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
  userId: z.string("User Id is required"),
});

export const reSendOtpValidation = z.object({
  userId: z.string("User Id is required"),
});

export const verifiyToken = z.object({
  token: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

export const loginValidation = verifiyToken.extend({
  userId: z.string("User Id is required"),
});

export const registerTOTPToken = verifiyToken.extend({
  friendlyName: z.string(),
});

export const twoFaRegisterMethod = z.object({
  method: z.enum(["totp", "passkeys"], {
    error: "invalid method type",
  }),
});

export const dangerZoneValidator = z.object({
  method: z.enum(["deactivate", "wipe", "delete"], {
    error: "invalid method type",
  }),
});

export const updateUserInfoValidator = z.object({
  name: z.string("User name is Required"),
});

export const uploadAvatarValidator = z.object({
  extension: z.string("File Extenstion are the Required"),
  contentType: z.string("File ContentType are the Required"),
});
