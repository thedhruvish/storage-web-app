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
import { APP_NAME } from "../constants/constant.js";
import { Resend } from "resend";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_EMAIL = process.env.SMTP_EMAIL;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_SECURE = process.env.SMTP_SECURE;

const resend = new Resend(SMTP_PASS);

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: Boolean(SMTP_SECURE),
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const sendOtpToMail = async (userId, userEmail) => {
  let email = null;
  let senderUserId = null;

  if (userEmail) {
    email = userEmail;
    senderUserId = userId;
  } else {
    const user = await User.findById(userId).select({ email: 1 }).lean();
    if (!user) throw new ApiError(404, "User not found");
    email = user.email;
    senderUserId = user._id.toString();
  }

  // genrator otp 6 digit
  const otp = randomInt(0, 1_000_000).toString().padStart(6, "0");

  await setRedisValue(`otp:${senderUserId}`, otp, {
    expiration: { type: "EX", value: 60 },
  });

  // send to mail
  try {
    // await transporter.sendMail({
    //   from: `${APP_NAME} <${SMTP_EMAIL}>`,
    //   to: email,
    //   subject: "Login OTP",
    //   text: `Your OTP was ${otp}`,
    //   html: otpTemplate(otp),
    // });
    const { data, error } = await resend.emails.send({
      from: `${APP_NAME} <${SMTP_EMAIL}>`,
      to: [email],
      subject: "Login OTP",
      // text: `Your OTP was ${otp}`,
      html: otpTemplate(otp),
    });
    if (error) {
      console.log(error);
      throw new ApiError(error.statusCode, error.message, error);
    }
  } catch (error) {
    console.log(error);
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
