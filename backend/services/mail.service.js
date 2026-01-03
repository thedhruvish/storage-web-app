import nodemailer from "nodemailer";
import { randomInt } from "node:crypto";
import User from "../models/User.model.js";
import { otpTemplate } from "../constants/otpMailTemplate.js";
import ApiError from "../utils/ApiError.js";
import {
  deleteRedisKey,
  getRedisValue,
  setRedisValue,
} from "./redis.service.js";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const sendOtpToMail = async (userId) => {
  const user = await User.findById(userId).select({ email: 1 }).lean();
  if (!user) throw new ApiError(404, "User not found");

  // genrator otp 6 digit
  const otp = randomInt(0, 1_000_000).toString().padStart(6, "0");

  await setRedisValue(`otp:${userId}`, otp, {
    expiration: { type: "EX", value: 60 },
  });

  // send to mail
  try {
    await transporter.sendMail({
      from: `"Dhruvish Storage-app" <${SMTP_USER}>`,
      to: user.email,
      subject: "Login OTP",
      html: otpTemplate(otp),
    });
  } catch (error) {
    console.log(err);
    throw new ApiError(500, "Mail send failed");
  }
};

export const verifyMailOTP = async (userId, otp) => {
  const key = `otp:${userId}`;
  const saveOTP = await getRedisValue(key);

  if (!saveOTP || otp == !saveOTP) {
    throw new ApiError(400, "Invalid otp or It Expired");
  }
  await deleteRedisKey(key);
};
