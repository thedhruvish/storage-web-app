import { model, Schema } from "mongoose";

const PasskeySchema = new Schema(
  {
    credentialID: { type: String, required: true },
    credentialPublicKey: { type: Buffer, required: true },
    counter: { type: Number, required: true },
    transports: [String], // ['usb', 'nfc', 'ble', 'internal']
    friendlyName: { type: String, default: "Unknown Device" },
    createdAt: { type: Date, default: Date.now },
    lastUsed: { type: Date },
  },
  { _id: false },
);

const twoFaSchema = new Schema({
  // Recovery Codes:
  recoveryCodes: [{ type: String, select: false }],
  // enable two fa auth
  isEnabled: { type: Boolean, default: false },

  //   totp details
  totp: {
    friendlyName: { type: String },
    secret: { type: String, select: false },
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    lastUsed: { type: Date },
  },

  //   passkey details.
  passkeys: [PasskeySchema],
});

const TwoFa = model("TwoFa", twoFaSchema);

export default TwoFa;
