import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { authenticator } from "otplib";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { isoUint8Array } from "@simplewebauthn/server/helpers";

// gen a like for the qrcode
export const genTOTPUrl = (userEmail) => {
  const secret = authenticator.generateSecret();
  const serviceName = "Storage app";

  const otpauthUrl = authenticator.keyuri(userEmail, serviceName, secret);
  return { otpauthUrl, secret };
};

// backup code gen for the revcity
export const generateBackupCode = async (length = 10) => {
  const plainTextCodes = Array.from({ length }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase(),
  );
  const hashedCodes = await Promise.all(
    plainTextCodes.map(async (code) => await bcrypt.hash(code, 10)),
  );
  return { hashedCodes, plainTextCodes };
};

// passkey register
export const generateRegisterOptionInPasskey = async (user, passkeys) => {
  const options = await generateRegistrationOptions({
    rpName: "Storage app",
    rpID: "localhost",
    userID: isoUint8Array.fromUTF8String(user._id.toString()),
    userName: user.email,
    userDisplayName: user.name,
    attestationType: "none",
    excludeCredentials: passkeys?.map((pk) => ({
      id: pk.credentialID,
      type: "public-key",
    })),

    authenticatorSelection: {
      // Defaults
      residentKey: "preferred",
      userVerification: "preferred",
      // Optional
      // authenticatorAttachment: "platform",
    },
  });

  return options;
};

export const isValidTotpToken = ({ secret, token }) => {
  return authenticator.verify({
    secret: secret,
    token,
  });
};
