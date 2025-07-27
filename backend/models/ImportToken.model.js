import { model, Schema } from "mongoose";

const importTokenSchema = new Schema({
  refreshToken: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  services: {
    type: String,
    enum: ["google", "github"],
    default: "google",
  },
});

const ImportToken = model("ImportToken", importTokenSchema);
export default ImportToken;
