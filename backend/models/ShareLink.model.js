import { model, Schema } from "mongoose";

const shareLinkSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  link: {
    type: String,
    unique: true,
    required: true,
  },
  directoryId: {
    type: Schema.Types.ObjectId,
    ref: "Directory",
    required: true,
  },
});

const ShareLink = model("ShareLink", shareLinkSchema);
export default ShareLink;
