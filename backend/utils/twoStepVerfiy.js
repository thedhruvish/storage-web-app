import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { authenticator } from "otplib";

export const genTOTPUrl = (userEmail) => {
  const secret = authenticator.generateSecret();
  const serviceName = "Storage app";

  const otpauthUrl = authenticator.keyuri(userEmail, serviceName, secret);
  return { otpauthUrl, secret };
};

export const generateBackupCode = async (length = 10) => {
  const plainTextCodes = Array.from({ length }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase(),
  );
  const hashedCodes = await Promise.all(
    plainTextCodes.map(async (code) => await bcrypt.hash(code, 10)),
  );
  return { hashedCodes, plainTextCodes };
};
