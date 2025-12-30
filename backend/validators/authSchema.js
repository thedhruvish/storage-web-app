import { z } from "zod";

export const loginWithEmailValidation = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  turnstileToken: z.string("Turnstile Token is required"),
});

export const registerWithEmailValidation = loginWithEmailValidation.extend({
  name: z.string().min(3, "Name must be at least 3 characters long"),
});

export const loginWithGoogleValidation = z.object({
  idToken: z.string(),
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

export const verifiyToken = reSendOtpValidation.extend({
  token: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

export const twoFaRegisterMethod = z.object({
  method: z.enum(["totp", "passkeys"], {
    error: "invalid method type",
  }),
});
