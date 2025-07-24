import nodemailer from "nodemailer";
import { randomInt } from "node:crypto";
import Otp from "../models/Otp.model.js";
import User from "../models/User.model.js";
import ApiError from "./ApiError.js";

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

  const otpTemplate = `<body style="margin:0;padding:0;background-color:#f7f7f7;">
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      style="background-color:#f7f7f7;"
    >
      <tr>
        <td align="center">
          <table
            width="600"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="margin:40px auto;border-radius:8px;background-color:#ffffff;border:1px solid #e5e5e5;"
          >
            <!-- Header -->
            <tr>
              <td align="center" style="padding:40px 40px 20px;">
                <img
                  src="https://github.com/thedhruvish.png"
                  alt="Company Logo"
                  width="120"
                  style="display:block;border:0;"
                />
              </td>
            </tr>

            <!-- Title -->
            <tr>
              <td align="center" style="padding:0 40px 10px;">
                <h1 style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:22px;color:#333333;">
                  Login Verification
                </h1>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:0 40px 30px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:24px;color:#555555;">
                <p style="margin:0;">
                  Hi there,
                </p>
                <p style="margin:16px 0 0;">
                  To complete your sign-in, please use the 6-digit code below.
                  It expires in <strong>5 minutes</strong>.
                </p>
              </td>
            </tr>

            <!-- OTP Box -->
            <tr>
              <td align="center" style="padding:0 40px 30px;">
                <table
                  cellpadding="0"
                  cellspacing="0"
                  role="presentation"
                  style="border-collapse:separate;"
                >
                  <tr>
                    <td
                      align="center"
                      style="
                        padding:12px 24px;
                        font-family:Arial,Helvetica,sans-serif;
                        font-size:32px;
                        font-weight:bold;
                        color:#ffffff;
                        background-color:#4f46e5;
                        border-radius:6px;
                        text-decoration:none;
                        letter-spacing:4px;
                      "
                    >
                      ${otp}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:0 40px 40px;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#888888;">
                <p style="margin:0;">
                  Didn’t request this? You can safely ignore this email.
                </p>
                <p style="margin:8px 0 0;">
                  &copy; 2025 Dhruvish Inc. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>`;
  // send to mail
  try {
    await transporter.sendMail({
      from: `"Dhruvish Storage-app" <${SMTP_USER}>`,
      to: user.email,
      subject: "Login OTP",
      html: otpTemplate,
    });
  } catch (error) {
    console.log(err);
    throw new ApiError(500, "Mail send failed");
  }
};
