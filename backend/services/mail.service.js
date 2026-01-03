import nodemailer from "nodemailer";
import { randomInt } from "node:crypto";
import Otp from "../models/Otp.model.js";
import User from "../models/User.model.js";

import { otpTemplate } from "../constants/otpMailTemplate.js";
import ApiError from "../utils/ApiError.js";

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

  // delete exting otp to create by this user
  await Otp.deleteMany({ userId });

  // genrator otp 6 digit
  const otp = randomInt(0, 1_000_000).toString().padStart(6, "0");
  await Otp.create({ userId, otp });

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
  const optDoc = await Otp.findOne({ userId, otp });

  if (!optDoc) {
    throw new ApiError(400, "Invalid otp or It Expired");
  }
  // delete after verfiy otp
  await optDoc.deleteOne();
};
